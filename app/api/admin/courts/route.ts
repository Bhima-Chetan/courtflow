import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const courts = await prisma.court.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(courts);
  } catch (error) {
    console.error('Error fetching courts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, baseRate, description, imageUrl } = body;

    if (!name || !type || baseRate === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const court = await prisma.court.create({
      data: {
        name,
        type,
        baseRate: parseFloat(baseRate),
        description,
        imageUrl,
      },
    });

    return NextResponse.json(court, { status: 201 });
  } catch (error) {
    console.error('Error creating court:', error);
    return NextResponse.json(
      { error: 'Failed to create court' },
      { status: 500 }
    );
  }
}
