import { NextRequest, NextResponse } from 'next/server';
import { pricingService } from '@/lib/services/pricing.service';

export async function GET() {
  try {
    const rules = await pricingService.getAllRules();
    return NextResponse.json(rules);
  } catch (error) {
    console.error('Error fetching pricing rules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pricing rules' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, conditions, amount, isPercentage, priority, isActive } = body;

    if (!name || !type || amount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const rule = await pricingService.createOrUpdateRule(undefined, {
      name,
      type,
      conditions,
      amount: parseFloat(amount),
      isPercentage: Boolean(isPercentage),
      priority: priority ? parseInt(priority) : 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    return NextResponse.json(rule, { status: 201 });
  } catch (error) {
    console.error('Error creating pricing rule:', error);
    return NextResponse.json(
      { error: 'Failed to create pricing rule' },
      { status: 500 }
    );
  }
}
