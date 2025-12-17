import { NextRequest, NextResponse } from 'next/server';
import { bookingService } from '@/lib/services/booking.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, courtId, coachId, startTime, endTime, equipment } = body;

    if (!userId || !courtId || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const booking = await bookingService.createBooking({
      userId,
      courtId,
      coachId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      equipment,
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create booking';
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'UserId is required' },
        { status: 400 }
      );
    }

    const includeHistory = searchParams.get('includeHistory') === 'true';
    const bookings = await bookingService.getUserBookings(userId, includeHistory);

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
