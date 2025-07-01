import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUserFromToken } from '@/lib/auth';

import { prisma } from '@/lib/prisma/prismaClient';

export const dynamic = "force-dynamic";

// Get all categories (Admin only - or public depending on requirements)
export async function GET(req: NextRequest) {
  try {
    // Optionally, check if user is admin if categories should only be fetched by admins
    

    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create new category (Admin only)
export async function POST(req: NextRequest) {
  try {
    const currentUser = await getUserFromToken(req);
    console.log(currentUser);
    if (!currentUser ) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const { name } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Check if category already exists
    const existingCategory = await prisma.category.findUnique({
      where: { name }
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category with this name already exists' },
        { status: 409 }
      );
    }

    const newCategory = await prisma.category.create({
      data: { name },
      select: {
        id: true,
        name: true,
        createdAt: true
      }
    });

    return NextResponse.json({ message: 'Category created successfully', category: newCategory }, { status: 201 });
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 