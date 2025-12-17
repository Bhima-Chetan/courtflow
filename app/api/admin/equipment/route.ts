import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const equipment = await prisma.equipment.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(equipment);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch equipment' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, size, totalQuantity, pricePerHour, perSlotMax, description, imageUrl } = body;

    if (!name || !type || totalQuantity === undefined || pricePerHour === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const equipment = await prisma.equipment.create({
      data: {
        name,
        type,
        size,
        totalQuantity: parseInt(totalQuantity),
        availableQty: parseInt(totalQuantity),
        pricePerHour: parseFloat(pricePerHour),
        perSlotMax: perSlotMax ? parseInt(perSlotMax) : 10,
        description,
        imageUrl,
      },
    });

    return NextResponse.json(equipment, { status: 201 });
  } catch (error) {
    console.error('Error creating equipment:', error);
    return NextResponse.json(
      { error: 'Failed to create equipment' },
      { status: 500 }
    );
  }
}
