// app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUserFromToken } from '@/lib/auth';

import { prisma } from '@/lib/prisma/prismaClient';

export const dynamic = "force-dynamic";

// Get order by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const currentUser = await getUserFromToken(req);

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            product: {
              select: { id: true, title: true, imageUrl: true, price: true }
            }
          }
        },
        wilaya: true
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if user can access this order
    if (
      !currentUser 
    ) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update order (Admin only)
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
    const { status, wilayaId, orderItems } = await req.json();

    const existingOrder = await prisma.order.findUnique({
      where: { id }
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (status) updateData.status = status.toUpperCase();
    if (wilayaId) updateData.wilayaId = wilayaId;

    // If orderItems are provided, update them with correct price logic
    if (orderItems && Array.isArray(orderItems) && orderItems.length > 0) {
      // Validate and prepare new order items
      const validatedItems = [];
      for (const item of orderItems) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        if (!product || !product.isActivated) {
          return NextResponse.json(
            { error: `Product ${item.productId} not found or inactive` },
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
        validatedItems.push({
          productId: item.productId,
          quantity: item.quantity,
          price: unitPrice
        });
      }
      // Remove old order items and add new ones
      await prisma.orderItem.deleteMany({ where: { orderId: id } });
      await prisma.order.update({
        where: { id },
        data: {
          orderItems: {
            create: validatedItems
          }
        }
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json({
      message: 'Order updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete order (Admin only)
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

    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: { orderItems: true }
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Restore product quantities if order is cancelled
    for (const item of existingOrder.orderItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          quantity: {
            increment: item.quantity
          }
        }
      });
    }

    await prisma.order.delete({
      where: { id }
    });

    return NextResponse.json({
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('Delete order error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}