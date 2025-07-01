// File: app/api/wilayas/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUserFromToken } from '@/lib/auth';

import { prisma } from '@/lib/prisma/prismaClient';

export const dynamic = "force-dynamic";

// Add new wilaya (Admin only)
export async function POST(req: NextRequest) {
  try {
    // Check if user is admin
    const currentUser = await getUserFromToken(req);
    if (!currentUser ) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const { name, deliveryPrice, agencyName, wilaya_number } = await req.json();

    if (!name || !deliveryPrice || !agencyName || wilaya_number === undefined || wilaya_number === null) {
      return NextResponse.json(
        { error: 'Name, delivery price, agency name, and wilaya_number are required' },
        { status: 400 }
      );
    }

    // Check if wilaya name or wilaya_number already exists
    const existingWilaya = await prisma.wilaya.findFirst({
      where: {
        OR: [
          { name },
          { wilaya_number: Number(wilaya_number) }
        ]
      }
    });

    if (existingWilaya) {
      if (existingWilaya.name === name) {
        return NextResponse.json(
          { error: 'Wilaya with this name already exists' },
          { status: 409 }
        );
      } else {
        return NextResponse.json(
          { error: 'Wilaya with this number already exists' },
          { status: 409 }
        );
      }
    }

    // Create wilaya
    const newWilaya = await prisma.wilaya.create({
      data: {
        name,
        deliveryPrice: parseFloat(deliveryPrice),
        agencyName,
        wilaya_number: Number(wilaya_number)
      }
    });
    return NextResponse.json({
      message: `Wilaya ${newWilaya.name} created successfully with delivery price ${newWilaya.deliveryPrice.toLocaleString()} DA`,
      wilaya: newWilaya
    });
  } catch (error) {
    console.error('Create wilaya error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get all wilayas
export async function GET(req: NextRequest) {
  try {
    const wilayas = await prisma.wilaya.findMany({
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({ wilayas });
  } catch (error) {
    console.error('Error fetching wilayas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wilayas' },
      { status: 500 }
    );
  }
}
