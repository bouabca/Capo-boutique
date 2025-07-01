import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";
import { getUserFromToken } from "@/lib/auth";

import { prisma } from "@/lib/prisma/prismaClient";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getUserFromToken(request);
    if (!currentUser ) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = search
      ? {
          OR: [
            { title: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { sku: { contains: search, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : {};

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id: true,
          title: true,
          sku: true,
          quantity: true,
          isActivated: true,
          updatedAt: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      products,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching stock items:", error);
    return NextResponse.json(
      { error: "Failed to fetch stock items" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getUserFromToken(request);
    if (!currentUser ) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const { id, quantity } = await request.json();

    if (!id || typeof quantity !== "number") {
      return NextResponse.json(
        { error: "Missing product ID or invalid quantity." },
        { status: 400 }
      );
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 }
      );
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { quantity },
      select: {
        id: true,
        title: true,
        sku: true,
        quantity: true,
        isActivated: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      message: "Product quantity updated successfully.",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product quantity:", error);
    return NextResponse.json(
      { error: "Failed to update product quantity." },
      { status: 500 }
    );
  }
} 