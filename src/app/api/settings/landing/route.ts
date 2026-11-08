import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, successResponse, errorResponse } from '@/lib/utils';
import { z } from 'zod';

const updateLandingSchema = z.object({
  universityName: z.string().optional(),
  portalTitle: z.string().optional(),
  portalSubtitle: z.string().optional(),
  announcementTitle: z.string().optional(),
  announcementBody: z.string().optional(),
  bannerImageUrl: z.string().nullable().optional(),
});

export async function GET() {
  try {
    let setting = await prisma.landingSetting.findUnique({
      where: { id: 'default' },
    });

    if (!setting) {
      setting = await prisma.landingSetting.create({
        data: {
          id: 'default',
        },
      });
    }

    return NextResponse.json({ setting });
  } catch (error) {
    console.error('Error fetching landing settings:', error);
    return NextResponse.json(
      { error: 'Gagal memuat pengaturan landing' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const validation = updateLandingSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(validation.error.issues[0]?.message || 'Input tidak valid', 400);
    }

    const setting = await prisma.landingSetting.upsert({
      where: { id: 'default' },
      update: validation.data,
      create: {
        id: 'default',
        ...validation.data,
      },
    });

    return successResponse(setting);
  } catch (err) {
    console.error('Error updating landing settings:', err);
    return errorResponse('Gagal memperbarui pengaturan landing', 500);
  }
}
