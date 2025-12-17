import { NextRequest, NextResponse } from 'next/server';
import { pricingService } from '@/lib/services/pricing.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { courtId, startTime, endTime, coachId, equipment } = body;

    if (!courtId || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const priceBreakdown = await pricingService.calculatePrice(
      courtId,
      new Date(startTime),
      new Date(endTime),
      coachId,
      equipment
    );

    return NextResponse.json(priceBreakdown);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to calculate price';
    console.error('Error calculating price:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
