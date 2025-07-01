export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/prismaClient';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const heroTitle = formData.get('heroTitle') as string | null;
    const heroDescription = formData.get('heroDescription') as string | null;
    const heroTitleColor = formData.get('heroTitleColor') as string | null;
    const heroDescriptionColor = formData.get('heroDescriptionColor') as string | null;
    const imageFile = formData.get('heroImage') as File | null;
    const removeHeroImage = formData.get('removeHeroImage') === 'true';

    // Check if CMS record exists (we only allow one)
    let cms = await prisma.cms.findFirst();
    let oldImageUrl = cms?.heroImage || '';
    let newImageUrl = oldImageUrl;

    // Handle image removal if requested
    if (removeHeroImage && oldImageUrl) {
      try {
        const urlParts = oldImageUrl.split('/');
        const publicIdWithExtension = urlParts[urlParts.length - 1];
        const publicId = publicIdWithExtension.split('.')[0];
        if (publicId) {
          await cloudinary.uploader.destroy(`planted-ecommerce/cms/${publicId}`);
        }
      } catch (err) {
        // Ignore image deletion errors
      }
      newImageUrl = '';
    }

    // Handle image upload if provided
    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({
          folder: 'planted-ecommerce/cms'
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
      // Remove old image if updating
      if (cms && oldImageUrl && newImageUrl !== oldImageUrl) {
        try {
          const urlParts = oldImageUrl.split('/');
          const publicIdWithExtension = urlParts[urlParts.length - 1];
          const publicId = publicIdWithExtension.split('.')[0];
          if (publicId) {
            await cloudinary.uploader.destroy(`planted-ecommerce/cms/${publicId}`);
          }
        } catch (err) {
          // Ignore image deletion errors
        }
      }
    }

    const updateData: any = {};
    if (heroTitle !== null) updateData.heroTitle = heroTitle;
    if (heroDescription !== null) updateData.heroDescription = heroDescription;
    if (heroTitleColor !== null) updateData.heroTitleColor = heroTitleColor;
    if (heroDescriptionColor !== null) updateData.heroDescriptionColor = heroDescriptionColor;
    if (removeHeroImage) updateData.heroImage = '';
    if (imageFile && newImageUrl !== oldImageUrl) updateData.heroImage = newImageUrl;

    if (cms) {
      // Update
      cms = await prisma.cms.update({
        where: { id: cms.id },
        data: updateData,
      });
    } else {
      // Create
      cms = await prisma.cms.create({
        data: updateData,
      });
    }
    return NextResponse.json({ cms, message: 'CMS content saved successfully!' });
  } catch (error) {
    console.error('CMS POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const cms = await prisma.cms.findFirst();
    return NextResponse.json({ cms });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 