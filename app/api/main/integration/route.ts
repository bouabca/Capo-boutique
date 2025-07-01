export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/prismaClient';

// GET: Return the current Dintegration record (if any)
export async function GET(req: NextRequest) {
  try {
    const integration = await prisma.dintegration.findFirst();
    return NextResponse.json({ integration });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create or update the Dintegration record
export async function POST(req: NextRequest) {
  try {
    const { sheets, facebookPixelId } = await req.json();
    // sheets: array of { name, id }
    let integration = await prisma.dintegration.findFirst();
    if (integration) {
      integration = await prisma.dintegration.update({
        where: { id: integration.id },
        data: {
          sheetsIntegration: sheets ? sheets : [],
          facebookPixelId: facebookPixelId || null,
        },
      });
    } else {
      integration = await prisma.dintegration.create({
        data: {
          sheetsIntegration: sheets ? sheets : [],
          facebookPixelId: facebookPixelId || null,
        },
      });
    }
    return NextResponse.json({ integration });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 