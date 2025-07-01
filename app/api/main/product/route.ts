// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { getUserFromToken } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';
import { prisma } from '@/lib/prisma/prismaClient';

export const dynamic = "force-dynamic";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Get all products (Public)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = search
      ? {
          OR: [
            { title: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { sku: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { description: { contains: search, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : {};

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
        },
        orderBy: {
          createdAt: 'desc',
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
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// Create new product (Admin only)
export async function POST(req: NextRequest) {
  try {
    const currentUser = await getUserFromToken(req);
    if (!currentUser ) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const formData = await req.formData();

    const title = formData.get('title') as string;
    const description = formData.get('description') as string | null;
    const price = formData.get('price') as string;
    const categoryId = formData.get('categoryId') as string;
    const sku = formData.get('sku') as string | null;
    const quantity = formData.get('quantity') as string | null;
    const isActivated = formData.get('isActivated') === 'true';
    const imageFile = formData.get('imageFile') as File | null;
    const productPriceForQtyRaw = formData.get('productPriceForQty') as string | null;
    let productPriceForQty = null;
    if (productPriceForQtyRaw) {
      try {
        productPriceForQty = JSON.parse(productPriceForQtyRaw);
      } catch (e) {
        return NextResponse.json({ error: 'Invalid productPriceForQty format' }, { status: 400 });
      }
    }

    // Validate required fields
    if (!title || !price || !categoryId || !imageFile) {
      return NextResponse.json(
        { error: 'Missing required fields: title, price, categoryId, image' },
        { status: 400 }
      );
    }

    let imageUrl = '';
    if (imageFile) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({
          folder: 'planted-ecommerce/products'
        }, (error: any, result: any) => {
          if (error) return reject(error);
          resolve(result);
        }).end(buffer);
      });

      if (uploadResult && typeof uploadResult === 'object' && 'secure_url' in uploadResult) {
        imageUrl = (uploadResult as { secure_url: string }).secure_url;
      } else {
        throw new Error('Cloudinary upload failed: Missing secure_url');
      }
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      // If category not found and an image was uploaded, attempt to delete it from Cloudinary.
      if (imageUrl) {
        const publicId = imageUrl.split('/').pop()?.split('.')[0];
        if (publicId) await cloudinary.uploader.destroy(publicId);
      }
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 400 }
      );
    }

    // Check if SKU is unique
    if (sku) {
      const existingSku = await prisma.product.findUnique({
        where: { sku }
      });

      if (existingSku) {
        // If SKU exists and an image was uploaded, attempt to delete it from Cloudinary.
        if (imageUrl) {
          const publicId = imageUrl.split('/').pop()?.split('.')[0];
          if (publicId) await cloudinary.uploader.destroy(publicId);
        }
        return NextResponse.json(
          { error: 'SKU already exists' },
          { status: 400 }
        );
      }
    }

    const product = await prisma.product.create({
      data: {
        title,
        description,
        imageUrl,
        price: parseFloat(price),
        categoryId,
        sku,
        quantity: quantity ? parseInt(quantity) : 0,
        isActivated,
        productPriceForQty,
      },
      include: {
        category: {
          select: { id: true, name: true }
        }
      }
    });

    return NextResponse.json({
      message: 'Product created successfully',
      product
    }, { status: 201 });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}