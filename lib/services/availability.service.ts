import prisma from '@/lib/prisma';
import { AvailabilitySlot } from '@/lib/types';
import { getDayOfWeek, getTimeSlots } from '@/lib/utils';
import { BookingStatus } from '@prisma/client';

export class AvailabilityService {
  async getAvailabilityForDate(date: Date): Promise<AvailabilitySlot[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const [courts, coaches, equipment, bookings] = await Promise.all([
      prisma.court.findMany({ where: { status: 'ACTIVE' } }),
      prisma.coach.findMany({ 
        where: { status: 'ACTIVE' },
        include: { availability: true }
      }),
      prisma.equipment.findMany({ where: { status: 'ACTIVE' } }),
      prisma.booking.findMany({
        where: {
          // Include ANY booking that overlaps the day (not just bookings that start that day)
          startTime: { lt: endOfDay },
          endTime: { gt: startOfDay },
          status: { in: [BookingStatus.CONFIRMED, BookingStatus.WAITLISTED] },
        },
        include: { bookingItems: true },
      }),
    ]);

    console.log(`📅 Checking availability for ${date.toDateString()}`);
    console.log(`📊 Found ${bookings.length} existing bookings:`, bookings.map(b => ({
      id: b.id,
      courtId: b.courtId,
      coachId: b.coachId,
      startTime: b.startTime,
      endTime: b.endTime,
      status: b.status
    })));

    const dayOfWeek = getDayOfWeek(date);
    const timeSlots = getTimeSlots(6, 23, 60);
    const slots: AvailabilitySlot[] = [];

    for (const timeStr of timeSlots) {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const slotStart = new Date(date);
      slotStart.setHours(hours, minutes, 0, 0);
      
      const slotEnd = new Date(slotStart);
      slotEnd.setHours(hours + 1, minutes, 0, 0);

      const bookedCourts = bookings
        .filter(b => 
          (b.startTime <= slotStart && b.endTime > slotStart) ||
          (b.startTime < slotEnd && b.endTime >= slotEnd) ||
          (b.startTime >= slotStart && b.endTime <= slotEnd)
        )
        .map(b => b.courtId);

      const availableCourts = courts
        .filter(c => !bookedCourts.includes(c.id))
        .map(c => c.id);

      console.log(`  ${timeStr}: ${bookedCourts.length > 0 ? '🔴 Booked' : '🟢 Available'} courts - Booked: [${bookedCourts.join(', ')}], Available: [${availableCourts.join(', ')}]`);

      const bookedCoaches = bookings
        .filter(b => 
          b.coachId &&
          ((b.startTime <= slotStart && b.endTime > slotStart) ||
          (b.startTime < slotEnd && b.endTime >= slotEnd) ||
          (b.startTime >= slotStart && b.endTime <= slotEnd))
        )
        .map(b => b.coachId)
        .filter(Boolean) as string[];

      const availableCoaches = coaches
        .filter(coach => {
          if (bookedCoaches.includes(coach.id)) {
            console.log(`❌ Coach ${coach.name} is booked for ${timeStr}`);
            return false;
          }

          // If no schedule is configured, treat an ACTIVE coach as available.
          if (!coach.availability || coach.availability.length === 0) {
            console.log(`✅ Coach ${coach.name} has no schedule; treating as available for ${timeStr}`);
            return true;
          }
          
          const hasAvailability = coach.availability.some(avail => {
            if (!avail.isActive) return false;
            
            if (avail.isOverride && avail.specificDate) {
              const specificDate = new Date(avail.specificDate);
              return specificDate.toDateString() === date.toDateString() &&
                     this.isTimeInRange(timeStr, avail.startTime, avail.endTime);
            }
            
            return avail.dayOfWeek === dayOfWeek &&
                   this.isTimeInRange(timeStr, avail.startTime, avail.endTime);
          });
          
          if (!hasAvailability) {
            console.log(`❌ Coach ${coach.name} has no availability schedule for ${dayOfWeek} at ${timeStr}`);
            console.log(`   Coach availability:`, coach.availability.map(a => ({
              dayOfWeek: a.dayOfWeek,
              startTime: a.startTime,
              endTime: a.endTime,
              isActive: a.isActive,
              isOverride: a.isOverride
            })));
          } else {
            console.log(`✅ Coach ${coach.name} is available for ${timeStr}`);
          }
          
          return hasAvailability;
        })
        .map(c => c.id);

      const equipmentUsage = new Map<string, number>();
      bookings
        .filter(b => 
          (b.startTime <= slotStart && b.endTime > slotStart) ||
          (b.startTime < slotEnd && b.endTime >= slotEnd) ||
          (b.startTime >= slotStart && b.endTime <= slotEnd)
        )
        .forEach(booking => {
          booking.bookingItems.forEach(item => {
            const current = equipmentUsage.get(item.equipmentId) || 0;
            equipmentUsage.set(item.equipmentId, current + item.quantity);
          });
        });

      const availableEquipment = equipment.map(eq => ({
        id: eq.id,
        name: eq.name,
        type: eq.type,
        available: eq.totalQuantity - (equipmentUsage.get(eq.id) || 0),
      }));

      slots.push({
        time: timeStr,
        available: availableCourts.length > 0,
        availableCourts,
        availableCoaches,
        availableEquipment,
      });
    }

    return slots;
  }

  async checkAvailability(
    courtId: string,
    startTime: Date,
    endTime: Date,
    coachId?: string,
    equipmentRequests?: { equipmentId: string; quantity: number }[]
  ): Promise<{ available: boolean; reason?: string }> {
    const existingBooking = await prisma.booking.findFirst({
      where: {
        courtId,
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.WAITLISTED] },
        OR: [
          { AND: [{ startTime: { lte: startTime } }, { endTime: { gt: startTime } }] },
          { AND: [{ startTime: { lt: endTime } }, { endTime: { gte: endTime } }] },
          { AND: [{ startTime: { gte: startTime } }, { endTime: { lte: endTime } }] },
        ],
      },
    });

    if (existingBooking) {
      return { available: false, reason: 'Court is already booked for this time slot' };
    }

    if (coachId) {
      const coachBooking = await prisma.booking.findFirst({
        where: {
          coachId,
          status: { in: [BookingStatus.CONFIRMED, BookingStatus.WAITLISTED] },
          OR: [
            { AND: [{ startTime: { lte: startTime } }, { endTime: { gt: startTime } }] },
            { AND: [{ startTime: { lt: endTime } }, { endTime: { gte: endTime } }] },
            { AND: [{ startTime: { gte: startTime } }, { endTime: { lte: endTime } }] },
          ],
        },
      });

      if (coachBooking) {
        return { available: false, reason: 'Coach is not available for this time slot' };
      }

      const coach = await prisma.coach.findUnique({
        where: { id: coachId },
        include: { availability: true },
      });

      if (coach) {
        const dayOfWeek = getDayOfWeek(startTime);
        const timeStr = `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}`;

        // If no schedule is configured, treat an ACTIVE coach as available.
        if (!coach.availability || coach.availability.length === 0) {
          return { available: true };
        }
        
        const hasAvailability = coach.availability.some(avail => {
          if (!avail.isActive) return false;
          
          if (avail.isOverride && avail.specificDate) {
            const specificDate = new Date(avail.specificDate);
            return specificDate.toDateString() === startTime.toDateString() &&
                   this.isTimeInRange(timeStr, avail.startTime, avail.endTime);
          }
          
          return avail.dayOfWeek === dayOfWeek &&
                 this.isTimeInRange(timeStr, avail.startTime, avail.endTime);
        });

        if (!hasAvailability) {
          return { available: false, reason: 'Coach does not have availability at this time' };
        }
      }
    }

    if (equipmentRequests && equipmentRequests.length > 0) {
      for (const request of equipmentRequests) {
        const equipment = await prisma.equipment.findUnique({
          where: { id: request.equipmentId },
          include: {
            bookingItems: {
              where: {
                booking: {
                  status: { in: [BookingStatus.CONFIRMED, BookingStatus.WAITLISTED] },
                  OR: [
                    { AND: [{ startTime: { lte: startTime } }, { endTime: { gt: startTime } }] },
                    { AND: [{ startTime: { lt: endTime } }, { endTime: { gte: endTime } }] },
                    { AND: [{ startTime: { gte: startTime } }, { endTime: { lte: endTime } }] },
                  ],
                },
              },
            },
          },
        });

        if (!equipment) {
          return { available: false, reason: `Equipment not found: ${request.equipmentId}` };
        }

        const bookedQuantity = equipment.bookingItems.reduce((sum, item) => sum + item.quantity, 0);
        const availableQuantity = equipment.totalQuantity - bookedQuantity;

        if (availableQuantity < request.quantity) {
          return { 
            available: false, 
            reason: `Insufficient equipment available. Requested: ${request.quantity}, Available: ${availableQuantity}` 
          };
        }
      }
    }

    return { available: true };
  }

  private isTimeInRange(time: string, startTime: string, endTime: string): boolean {
    const timeMinutes = this.parseTimeToMinutes(time);
    const startMinutes = this.parseTimeToMinutes(startTime);
    const endMinutes = this.parseTimeToMinutes(endTime);
    return timeMinutes >= startMinutes && timeMinutes < endMinutes;
  }

  private parseTimeToMinutes(value: string): number {
    // Supports 'H:MM', 'HH:MM', and 'HH:MM:SS'
    const parts = value.split(':').map((p) => Number(p));
    const hours = parts[0] ?? 0;
    const minutes = parts[1] ?? 0;
    return hours * 60 + minutes;
  }
}

export const availabilityService = new AvailabilityService();
