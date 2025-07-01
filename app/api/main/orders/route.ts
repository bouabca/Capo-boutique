// app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUserFromToken } from '@/lib/auth';

import { prisma } from '@/lib/prisma/prismaClient';

export const dynamic = "force-dynamic";

// Get all orders (Admin only)
export async function GET(req: NextRequest) {
  try {
    const currentUser = await getUserFromToken(req);
    if (!currentUser ) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status.toUpperCase();
    
    // Add search conditions
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        
        { id: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [orders, total, products] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          orderItems: {
            include: {
              product: {
                select: { id: true, title: true, imageUrl: true }
              }
            }
          },
          wilaya: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.order.count({ where }),
      prisma.product.findMany({ select: { id: true, title: true } })
    ]);

    return NextResponse.json({
      orders,
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create new order
export async function POST(req: NextRequest) {
  try {
    const {
      firstName,
      lastName,
      phone,
      email,
      wilayaId,
      orderItems,
      baladia,
      house,
      couponCode
    } = await req.json();

    // Validate required fields
    if (!firstName || !lastName  || !phone || !orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get current user (optional for guests)
    const currentUser = await getUserFromToken(req);

    // Calculate total and validate products
    let total = 0;
    const validatedItems = [];

    // Coupon logic
    let couponMessage = null;
    let couponDiscount = 0;
    let couponId = null;
    let couponApplied = false;
    let couponSuccessMessage = null;
    if (couponCode) {
      if (!orderItems || !Array.isArray(orderItems) || orderItems.length !== 1 || orderItems[0].quantity !== 1) {
        couponMessage = {
          en: 'Coupon can only be used for a single quantity.',
          fr: 'Le coupon ne peut être utilisé que pour une seule quantité.',
          ar: 'يمكن استخدام القسيمة لكمية واحدة فقط.'
        };
      } else {
        // Check coupon existence and validity
        const coupon = await prisma.coupon.findUnique({
          where: { code: couponCode.toUpperCase() },
          include: { products: true }
        });
        if (!coupon) {
          couponMessage = {
            en: 'Coupon not found.',
            fr: 'Coupon introuvable.',
            ar: 'القسيمة غير موجودة.'
          };
        } else if (!coupon.isActive) {
          couponMessage = {
            en: 'Coupon is not active.',
            fr: 'Le coupon n\'est pas actif.',
            ar: 'القسيمة غير مفعلة.'
          };
        } else if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
          couponMessage = {
            en: 'Coupon has expired.',
            fr: 'Le coupon a expiré.',
            ar: 'انتهت صلاحية القسيمة.'
          };
        } else if (coupon.maxUsage !== null && coupon.usedCount >= coupon.maxUsage) {
          couponMessage = {
            en: 'Coupon usage limit reached.',
            fr: 'Limite d\'utilisation du coupon atteinte.',
            ar: 'تم الوصول إلى الحد الأقصى لاستخدام القسيمة.'
          };
        } else if (!coupon.products.some(p => p.productId === orderItems[0].productId)) {
          couponMessage = {
            en: 'Coupon is not valid for this product.',
            fr: 'Le coupon n\'est pas valable pour ce produit.',
            ar: 'القسيمة غير صالحة لهذا المنتج.'
          };
        } else {
          // Valid coupon
          couponDiscount = coupon.discount;
          couponId = coupon.id;
          couponApplied = true;
          couponSuccessMessage = {
            en: 'Coupon applied successfully!',
            fr: 'Coupon appliqué avec succès !',
            ar: 'تم تطبيق القسيمة بنجاح!'
          };
        }
      }
    }

    for (const item of orderItems) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });
      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 400 }
        );
      }
      if (product.quantity !== null && product.quantity < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for product ${product.title}` },
          { status: 400 }
        );
      }
      // Determine price based on productPriceForQty
      let unitPrice = product.price;
      if (product.productPriceForQty && Array.isArray(product.productPriceForQty)) {
        // Filter and sort by qty ascending
        const validTiers: { qty: number; price: number }[] = (product.productPriceForQty as any[]).reduce((arr, entry) => {
          if (entry && typeof entry === 'object' && typeof entry.qty === 'number' && typeof entry.price === 'number') {
            arr.push({ qty: entry.qty, price: entry.price });
          }
          return arr;
        }, [] as { qty: number; price: number }[]);
        const sorted: { qty: number; price: number }[] = validTiers.sort((a, b) => a.qty - b.qty);
        for (let i = sorted.length - 1; i >= 0; i--) {
          if (item.quantity >= sorted[i].qty) {
            unitPrice = sorted[i].price;
            break;
          }
        }
      }
      // Apply coupon discount if valid and this is the couponed item
      if (couponDiscount > 0 && orderItems.length === 1 && item.quantity === 1 && couponId) {
        unitPrice = Math.max(0, unitPrice - couponDiscount);
      }
      const itemTotal = unitPrice * item.quantity;
      total += itemTotal;
      validatedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: unitPrice
      });
    }

    // Add delivery cost if wilaya is specified
    let deliveryPrice = 0;
    if (wilayaId) {
      const wilaya = await prisma.wilaya.findUnique({
        where: { id: wilayaId }
      });
      if (wilaya) {
        deliveryPrice = wilaya.deliveryPrice;
        total += deliveryPrice;
      }
    }

    // Create order with order items
    const order = await prisma.order.create({
      data: {
        firstName,
        lastName,
        phone,
        email,
        total,
        wilayaId: wilayaId || null,
        baladia: baladia || null,
        house: typeof house === 'boolean' ? house : false,
        orderItems: {
          create: validatedItems
        }
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: { id: true, title: true, imageUrl: true }
            }
          }
        },
        wilaya: true
      }
    });

    // If coupon was used and valid, increment usedCount
    if (couponId && couponDiscount > 0 && !couponMessage) {
      await prisma.coupon.update({
        where: { id: couponId },
        data: { usedCount: { increment: 1 } }
      });
    }

    // Update product quantities
    for (const item of validatedItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          quantity: {
            decrement: item.quantity
          }
        }
      });
    }

    return NextResponse.json({
      message: 'Order created successfully',
      order,
      couponMessage,
      couponApplied,
      couponSuccessMessage,
      deliveryPrice,
      totalCost: total
    }, { status: 201 });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}