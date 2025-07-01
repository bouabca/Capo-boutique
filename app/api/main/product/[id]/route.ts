// app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/prismaClient';
import { getUserFromToken } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';

export const dynamic = "force-dynamic";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Get product by ID (Public)
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, name: true }
        },
        coupons: {
          include: {
            coupon: {
              select: { id: true, code: true, discount: true, isActive: true, expiresAt: true }
            }
          }
        }
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update product (Admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  let newImageUrl: string | undefined;
  let existingProduct: any; // Declare existingProduct here
  try {
    const currentUser = await getUserFromToken(req);
    if (!currentUser ) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const { id } = params;
    const formData = await req.formData();

    const title = formData.get('title') as string | null;
    const description = formData.get('description') as string | null;
    const price = formData.get('price') as string | null;
    const categoryId = formData.get('categoryId') as string | null;
    const sku = formData.get('sku') as string | null;
    const quantity = formData.get('quantity') as string | null;
    const isActivated = formData.get('isActivated') === 'true';
    const imageFile = formData.get('imageFile') as File | null;
    const imageUrlFromForm = formData.get('imageUrl') as string | null; // This will be the existing URL if no new file is uploaded
    const productPriceForQtyRaw = formData.get('productPriceForQty') as string | null;
    let productPriceForQty = null;
    if (productPriceForQtyRaw) {
      try {
        productPriceForQty = JSON.parse(productPriceForQtyRaw);
      } catch (e) {
        return NextResponse.json({ error: 'Invalid productPriceForQty format' }, { status: 400 });
      }
    }

    existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    newImageUrl = existingProduct.imageUrl; // Initialize with existing URL

    // Handle image upload if a new file is provided
    if (imageFile && imageFile.size > 0) {
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
        newImageUrl = (uploadResult as { secure_url: string }).secure_url;
      } else {
        throw new Error('Cloudinary upload failed: Missing secure_url');
      }

      // If a new image was uploaded and there was an old image, delete the old one
      if (existingProduct.imageUrl) {
        try {
          // Extract public ID from the full URL
          const urlParts = existingProduct.imageUrl.split('/');
          const publicIdWithExtension = urlParts[urlParts.length - 1];
          const publicId = publicIdWithExtension.split('.')[0];
          if (publicId) {
            await cloudinary.uploader.destroy(`planted-ecommerce/products/${publicId}`);
            console.log(`Old image ${publicId} deleted from Cloudinary.`);
          }
        } catch (cloudinaryError) {
          console.error('Cloudinary old image deletion error:', cloudinaryError);
          // Continue with product update even if old image deletion fails
        }
      }
    } else if (imageUrlFromForm === "" && existingProduct.imageUrl) {
      // Case where image is explicitly cleared from the form
      try {
        const urlParts = existingProduct.imageUrl.split('/');
        const publicIdWithExtension = urlParts[urlParts.length - 1];
        const publicId = publicIdWithExtension.split('.')[0];
        if (publicId) {
          await cloudinary.uploader.destroy(`planted-ecommerce/products/${publicId}`);
          console.log(`Old image ${publicId} deleted from Cloudinary due to explicit clear.`);
        }
      } catch (cloudinaryError) {
        console.error('Cloudinary old image deletion error on explicit clear:', cloudinaryError);
      }
      newImageUrl = ""; // Set to empty as image was cleared
    }

    // Check if category exists
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId }
      });

      if (!category) {
        // If category not found and a new image was uploaded, attempt to delete it.
        if (imageFile && imageFile.size > 0 && newImageUrl && newImageUrl !== existingProduct.imageUrl) {
            const urlParts = newImageUrl.split('/');
            const publicIdWithExtension = urlParts[urlParts.length - 1];
            const publicId = publicIdWithExtension.split('.')[0];
            if (publicId) await cloudinary.uploader.destroy(`planted-ecommerce/products/${publicId}`);
        }
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 400 }
        );
      }
    }

    // Check if SKU is unique (excluding current product)
    if (sku && sku !== existingProduct.sku) {
      const existingSkuCheck = await prisma.product.findUnique({
        where: { sku }
      });

      if (existingSkuCheck) {
        // If SKU exists and a new image was uploaded, attempt to delete it.
        if (imageFile && imageFile.size > 0 && newImageUrl && newImageUrl !== existingProduct.imageUrl) {
            const urlParts = newImageUrl.split('/');
            const publicIdWithExtension = urlParts[urlParts.length - 1];
            const publicId = publicIdWithExtension.split('.')[0];
            if (publicId) await cloudinary.uploader.destroy(`planted-ecommerce/products/${publicId}`);
        }
        return NextResponse.json(
          { error: 'SKU already exists' },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};
    if (title !== null) updateData.title = title;
    if (description !== null) updateData.description = description;
    if (price !== null) updateData.price = parseFloat(price);
    if (categoryId !== null) updateData.categoryId = categoryId;
    if (sku !== null) updateData.sku = sku;
    if (quantity !== null) updateData.quantity = parseInt(quantity);
    updateData.isActivated = isActivated; // Always update isActivated
    updateData.imageUrl = newImageUrl; // Use the (potentially new) image URL
    if (productPriceForQty !== null) updateData.productPriceForQty = productPriceForQty;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          select: { id: true, name: true }
        }
      }
    });

    return NextResponse.json({
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Update product error:', error);
    // If a new image was uploaded during this attempt and the update failed, clean it up.
    if (newImageUrl && existingProduct && newImageUrl !== existingProduct.imageUrl) {
      try {
        const urlParts = newImageUrl.split('/');
        const publicIdWithExtension = urlParts[urlParts.length - 1];
        const publicId = publicIdWithExtension.split('.')[0];
        if (publicId) await cloudinary.uploader.destroy(`planted-ecommerce/products/${publicId}`);
        console.log('Cleaned up newly uploaded image due to product update failure.');
      } catch (cleanupError) {
        console.error('Failed to clean up newly uploaded image from Cloudinary:', cleanupError);
      }
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete product (Admin only)
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

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        orderItems: true
      }
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if product has associated orders
    if (existingProduct.orderItems.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete product with existing orders. Consider deactivating instead.' },
        { status: 400 }
      );
    }

    // Delete image from Cloudinary before deleting product from DB
    if (existingProduct.imageUrl) {
      try {
        const urlParts = existingProduct.imageUrl.split('/');
        const publicIdWithExtension = urlParts[urlParts.length - 1];
        const publicId = publicIdWithExtension.split('.')[0];
        if (publicId) {
          await cloudinary.uploader.destroy(`planted-ecommerce/products/${publicId}`);
          console.log(`Image ${publicId} deleted from Cloudinary.`);
        }
      } catch (cloudinaryError) {
        console.error('Cloudinary image deletion error:', cloudinaryError);
        // Continue with product deletion even if image deletion fails
      }
    }

    await prisma.product.delete({
      where: { id }
    });

    return NextResponse.json({
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}