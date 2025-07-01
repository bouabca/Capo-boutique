// app/api/coupons/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUserFromToken } from '@/lib/auth';

import { prisma } from '@/lib/prisma/prismaClient';

export const dynamic = "force-dynamic";

// Get coupon by ID (Admin only)
export async function GET(
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

    const coupon = await prisma.coupon.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            product: {
              select: { id: true, title: true, imageUrl: true, price: true }
            }
          }
        }
      }
    });

    if (!coupon) {
      return NextResponse.json(
        { error: 'Coupon not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ coupon });
  } catch (error) {
    console.error('Get coupon error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update coupon (Admin only)
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
    const {
      code,
      discount,
      isActive,
      expiresAt,
      maxUsage,
      productIds
    } = await req.json();

    const existingCoupon = await prisma.coupon.findUnique({
      where: { id },
      include: { products: true }
    });

    if (!existingCoupon) {
      return NextResponse.json(
        { error: 'Coupon not found' },
        { status: 404 }
      );
    }

    // Check if coupon code already exists (excluding current coupon)
    if (code && code !== existingCoupon.code) {
      const duplicateCoupon = await prisma.coupon.findUnique({
        where: { code: code.toUpperCase() }
      });

      if (duplicateCoupon) {
        return NextResponse.json(
          { error: 'Coupon code already exists' },
          { status: 400 }
        );
      }
    }

    // Validate discount percentage
    if (discount !== undefined && (discount < 0 || discount > 100)) {
      return NextResponse.json(
        { error: 'Discount must be between 0 and 100' },
        { status: 400 }
      );
    }

    // Validate maxUsage if provided
    if (maxUsage !== undefined && maxUsage !== null) {
      if (typeof maxUsage !== 'number' || maxUsage < 1) {
        return NextResponse.json(
          { error: 'maxUsage must be a positive number or null for unlimited usage' },
          { status: 400 }
        );
      }
      
      // Check if new maxUsage is less than current usedCount
      if (maxUsage < existingCoupon.usedCount) {
        return NextResponse.json(
          { error: `maxUsage (${maxUsage}) cannot be less than current usage count (${existingCoupon.usedCount})` },
          { status: 400 }
        );
      }
    }

    // Validate products if provided
    if (productIds && Array.isArray(productIds) && productIds.length > 0) {
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } }
      });

      if (products.length !== productIds.length) {
        return NextResponse.json(
          { error: 'One or more product IDs are invalid' },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};
    if (code) updateData.code = code.toUpperCase();
    if (discount !== undefined) updateData.discount = parseInt(discount);
    if (isActive !== undefined) updateData.isActive = isActive;
    if (expiresAt !== undefined) updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;
    if (maxUsage !== undefined) updateData.maxUsage = maxUsage;

    // Update coupon with transaction to handle product associations
    const updatedCoupon = await prisma.$transaction(async (prisma) => {
      // Update basic coupon data
      const coupon = await prisma.coupon.update({
        where: { id },
        data: updateData
      });

      // Update product associations if provided
      if (productIds !== undefined) {
        // Delete existing associations
        await prisma.productCoupon.deleteMany({
          where: { couponId: id }
        });

        // Create new associations
        if (productIds.length > 0) {
          await prisma.productCoupon.createMany({
            data: productIds.map((productId: string) => ({
              couponId: id,
              productId
            }))
          });
        }
      }

      // Return updated coupon with associations
      return await prisma.coupon.findUnique({
        where: { id },
        include: {
          products: {
            include: {
              product: {
                select: { id: true, title: true, imageUrl: true }
              }
            }
          }
        }
      });
    }); // Close prisma.$transaction

    return NextResponse.json({ coupon: updatedCoupon });
  } catch (error) {
    console.error('Update coupon error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete coupon (Admin only)
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

    const existingCoupon = await prisma.coupon.findUnique({
      where: { id }
    });

    if (!existingCoupon) {
      return NextResponse.json(
        { error: 'Coupon not found' },
        { status: 404 }
      );
    }

    // Check if coupon has been used
    if (existingCoupon.usedCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete a coupon that has been used. Consider deactivating it instead.' },
        { status: 400 }
      );
    }

    await prisma.coupon.delete({
      where: { id }
    });

    return NextResponse.json({
      message: 'Coupon deleted successfully'
    });
  } catch (error) {
    console.error('Delete coupon error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}