import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { BookingStatus } from '@prisma/client';

export async function GET() {
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Get total bookings for this month
    const totalBookings = await prisma.booking.count({
      where: {
        createdAt: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
        status: {
          in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED],
        },
      },
    });

    // Get total revenue for this month
    const bookingsWithRevenue = await prisma.booking.findMany({
      where: {
        createdAt: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
        status: {
          in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED],
        },
      },
      select: {
        totalPrice: true,
      },
    });

    const totalRevenue = bookingsWithRevenue.reduce(
      (sum, booking) => sum + booking.totalPrice,
      0
    );

    // Get active courts count
    const activeCourts = await prisma.court.count({
      where: {
        status: 'ACTIVE',
      },
    });

    // Get active coaches count
    const activeCoaches = await prisma.coach.count({
      where: {
        status: 'ACTIVE',
      },
    });

    return NextResponse.json({
      totalBookings,
      totalRevenue,
      activeCourts,
      activeCoaches,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin stats' },
      { status: 500 }
    );
  }
}
