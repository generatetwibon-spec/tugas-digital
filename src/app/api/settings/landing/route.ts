import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, successResponse, errorResponse } from '@/lib/utils';
import { z } from 'zod';

const updateLandingSchema = z.object({
  institutionName: z.string().optional(),
  facultyName: z.string().optional(),
  universityName: z.string().optional(),
  portalTitle: z.string().optional(),
  portalSubtitle: z.string().optional(),
  heroHeadline: z.string().optional(),
  ctaButtonText: z.string().optional(),
  ctaHelperText: z.string().optional(),
  academicYear: z.string().optional(),
  logoUrl: z.string().nullable().optional(),
  heroImageUrl: z.string().nullable().optional(),
  announcementTitle: z.string().optional(),
  announcementBody: z.string().optional(),
  bannerImageUrl: z.string().nullable().optional(),
  feature1Title: z.string().optional(),
  feature1Desc: z.string().optional(),
  feature2Title: z.string().optional(),
  feature2Desc: z.string().optional(),
  feature3Title: z.string().optional(),
  feature3Desc: z.string().optional(),
  footerText: z.string().optional(),
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
