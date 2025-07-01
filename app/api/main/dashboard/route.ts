export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/prismaClient';

export async function GET(req: NextRequest) {
  try {
    // Total Orders
    const totalOrders = await prisma.order.count();
    // Total Products
    const totalProducts = await prisma.product.count();
    // In Stock (sum of all product quantities)
    const inStockAgg = await prisma.product.aggregate({
      _sum: { quantity: true }
    });
    const inStock = inStockAgg._sum.quantity || 0;
    // Total Revenue (sum of all order totals)
    const totalRevenueAgg = await prisma.order.aggregate({
      _sum: { total: true }
    });
    const totalRevenue = totalRevenueAgg._sum.total || 0;
    // Recent Orders (last 4)
    const recentOrdersRaw = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 4,
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });
    const recentOrders = recentOrdersRaw.map(order => ({
      id: order.id,
      customer: order.firstName + ' ' + order.lastName,
      product: order.orderItems[0]?.product?.title || '',
      amount: order.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      status: order.status
    }));
    // Low Stock Products (quantity <= 5)
    const lowStockProductsRaw = await prisma.product.findMany({
      where: { quantity: { lte: 5 } },
      select: { title: true, quantity: true, sku: true }
    });
    const lowStockProducts = lowStockProductsRaw.map(p => ({
      name: p.title,
      stock: p.quantity,
      sku: p.sku
    }));
    return NextResponse.json({
      totalOrders,
      totalProducts,
      inStock,
      totalRevenue,
      recentOrders,
      lowStockProducts
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 