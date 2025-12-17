import { NextRequest, NextResponse } from 'next/server';
import { bookingService } from '@/lib/services/booking.service';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'UserId is required' },
        { status: 400 }
      );
    }

    const booking = await bookingService.cancelBooking(id, userId);

    return NextResponse.json(booking);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to cancel booking';
    console.error('Error canceling booking:', error);
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
