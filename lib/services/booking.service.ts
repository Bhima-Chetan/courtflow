import prisma from '@/lib/prisma';
import { BookingRequest } from '@/lib/types';
import { availabilityService } from './availability.service';
import { pricingService } from './pricing.service';
import { BookingStatus, type Prisma } from '@prisma/client';

export class BookingService {
  async createBooking(request: BookingRequest) {
    const availabilityCheck = await availabilityService.checkAvailability(
      request.courtId,
      request.startTime,
      request.endTime,
      request.coachId,
      request.equipment
    );

    if (!availabilityCheck.available) {
      throw new Error(availabilityCheck.reason || 'Slot not available');
    }

    const priceBreakdown = await pricingService.calculatePrice(
      request.courtId,
      request.startTime,
      request.endTime,
      request.coachId,
      request.equipment
    );

    return await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          userId: request.userId,
          courtId: request.courtId,
          coachId: request.coachId,
          startTime: request.startTime,
          endTime: request.endTime,
          status: BookingStatus.CONFIRMED,
          totalPrice: priceBreakdown.totalPrice,
          priceBreakdown: priceBreakdown as unknown as Prisma.InputJsonValue,
        },
      });

      if (request.equipment && request.equipment.length > 0) {
        for (const equipmentRequest of request.equipment) {
          const equipment = await tx.equipment.findUnique({
            where: { id: equipmentRequest.equipmentId },
          });

          if (!equipment) {
            throw new Error(`Equipment not found: ${equipmentRequest.equipmentId}`);
          }

          await tx.bookingItem.create({
            data: {
              bookingId: booking.id,
              equipmentId: equipmentRequest.equipmentId,
              quantity: equipmentRequest.quantity,
              pricePerUnit: equipment.pricePerHour,
              totalPrice: equipment.pricePerHour * equipmentRequest.quantity,
            },
          });
        }
      }

      return tx.booking.findUnique({
        where: { id: booking.id },
        include: {
          court: true,
          coach: true,
          bookingItems: {
            include: {
              equipment: true,
            },
          },
        },
      });
    });
  }

  async cancelBooking(bookingId: string, userId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { bookingItems: true },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.userId !== userId) {
      throw new Error('Unauthorized to cancel this booking');
    }

    if (booking.status === BookingStatus.CANCELED) {
      throw new Error('Booking is already canceled');
    }

    return await prisma.$transaction(async (tx) => {
      const canceledBooking = await tx.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.CANCELED },
      });

      const waitlistEntry = await tx.waitlistEntry.findFirst({
        where: {
          courtId: booking.courtId,
          startTime: booking.startTime,
          endTime: booking.endTime,
          status: 'WAITING',
        },
        orderBy: { createdAt: 'asc' },
      });

      if (waitlistEntry) {
        await tx.waitlistEntry.update({
          where: { id: waitlistEntry.id },
          data: { status: 'PROMOTED' },
        });

        await this.createBooking({
          userId: waitlistEntry.userId,
          courtId: waitlistEntry.courtId,
          startTime: waitlistEntry.startTime,
          endTime: waitlistEntry.endTime,
        });
      }

      return canceledBooking;
    });
  }

  async getUserBookings(userId: string, includeHistory: boolean = false) {
    const now = new Date();

    return prisma.booking.findMany({
      where: {
        userId,
        ...(includeHistory ? {} : { startTime: { gte: now } }),
      },
      include: {
        court: true,
        coach: true,
        bookingItems: {
          include: {
            equipment: true,
          },
        },
      },
      orderBy: { startTime: 'desc' },
    });
  }

  async addToWaitlist(
    userId: string,
    courtId: string,
    startTime: Date,
    endTime: Date
  ) {
    return prisma.waitlistEntry.create({
      data: {
        userId,
        courtId,
        startTime,
        endTime,
        status: 'WAITING',
      },
    });
  }

  async getWaitlistEntries(courtId: string, startTime: Date, endTime: Date) {
    return prisma.waitlistEntry.findMany({
      where: {
        courtId,
        startTime,
        endTime,
        status: 'WAITING',
      },
      include: {
        user: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}

export const bookingService = new BookingService();
