// app/api/coupons/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUserFromToken } from '@/lib/auth';

import { prisma } from '@/lib/prisma/prismaClient';

export const dynamic = "force-dynamic";

// Get all coupons (Admin only)
export async function GET(req: NextRequest) {
  try {
    const currentUser = await getUserFromToken(req);
    if (!currentUser ) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    // Fetch all coupons with their related products (id, title)
    const coupons = await prisma.coupon.findMany({
      include: {
        products: {
          include: {
            product: {
              select: { id: true, title: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Fetch all products (id, title)
    const products = await prisma.product.findMany({
      select: { id: true, title: true }
    });

    return NextResponse.json({
      coupons,
      products
    });
  } catch (error) {
    console.error('Get coupons error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create new coupon (Admin only)
export async function POST(req: NextRequest) {
  try {
    const currentUser = await getUserFromToken(req);
    if (!currentUser ) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const {
      code,
      discount,
      isActive,
      expiresAt,
      maxUsage,
      productIds
    } = await req.json();

    // Validate required fields
    if (!code || discount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: code, discount' },
        { status: 400 }
      );
    }

    // Validate discount is a float
    const discountValue = parseFloat(discount);
    if (isNaN(discountValue)) {
      return NextResponse.json(
        { error: 'Discount must be a number' },
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
    }

    // Check if coupon code already exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code }
    });

    if (existingCoupon) {
      return NextResponse.json(
        { error: 'Coupon code already exists' },
        { status: 400 }
      );
    }

    // Validate products if provided and check price - discount > 0
    if (productIds && Array.isArray(productIds) && productIds.length > 0) {
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, price: true }
      });

      if (products.length !== productIds.length) {
        return NextResponse.json(
          { error: 'One or more product IDs are invalid' },
          { status: 400 }
        );
      }

      // Check price - discount > 0 for each product (fixed amount only)
      for (const product of products) {
        const finalPrice = product.price - discountValue;
        if (finalPrice <= 0) {
          return NextResponse.json(
            { error: `Discount is too high for product ${product.id}. Final price must be greater than 0.` },
            { status: 400 }
          );
        }
      }
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        discount: discountValue,
        isActive: isActive !== false,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        maxUsage: maxUsage || null,
        usedCount: 0, // Initialize to 0 (though this is the default)
        products: productIds && productIds.length > 0 ? {
          create: productIds.map((productId: string) => ({
            productId
          }))
        } : undefined
      },
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

    return NextResponse.json({
      message: 'Coupon created successfully',
      coupon
    }, { status: 201 });
  } catch (error) {
    console.error('Create coupon error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}