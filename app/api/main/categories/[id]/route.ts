export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUserFromToken } from '@/lib/auth';

import { prisma } from '@/lib/prisma/prismaClient';

// Update category (Admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getUserFromToken(req);
    if (!currentUser ) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const { id } = params;
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if category name already exists (excluding the current category)
    if (name !== existingCategory.name) {
      const nameExists = await prisma.category.findUnique({
        where: { name }
      });
      if (nameExists) {
        return NextResponse.json(
          { error: 'Category with this name already exists' },
          { status: 409 }
        );
      }
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: { name },
      select: {
        id: true,
        name: true,
        updatedAt: true
      }
    });

    return NextResponse.json({ message: 'Category updated successfully', category: updatedCategory });
  } catch (error) {
    console.error('Update category error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete category (Admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getUserFromToken(req);
    if (!currentUser ) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const { id } = params;

    const existingCategory = await prisma.category.findUnique({
      where: { id },
      include: {
        products: true // Include products to check for associations
      }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Prevent deletion if products are associated with this category
    if (existingCategory.products.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with associated products. Please reassign products first.' },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 