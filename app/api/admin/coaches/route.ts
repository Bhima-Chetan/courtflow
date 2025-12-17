import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const coaches = await prisma.coach.findMany({
      where: { status: 'ACTIVE' },
      include: { availability: true },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(coaches);
  } catch (error) {
    console.error('Error fetching coaches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coaches' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, bio, specialization, hourlyRate, imageUrl, availability } = body;

    if (!name || hourlyRate === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const coach = await prisma.coach.create({
      data: {
        name,
        bio,
        specialization,
        hourlyRate: parseFloat(hourlyRate),
        imageUrl,
        availability: availability ? {
          create: availability,
        } : undefined,
      },
      include: { availability: true },
    });

    return NextResponse.json(coach, { status: 201 });
  } catch (error) {
    console.error('Error creating coach:', error);
    return NextResponse.json(
      { error: 'Failed to create coach' },
      { status: 500 }
    );
  }
}
