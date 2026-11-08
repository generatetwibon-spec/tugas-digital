import { requireAdmin, successResponse, errorResponse } from '@/lib/utils';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createSubjectSchema = z.object({
  name: z.string().min(1, 'Nama mata pelajaran wajib diisi'),
  level: z.string().optional(),
  description: z.string().optional(),
});

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const subjects = await prisma.subject.findMany({
      include: {
        _count: {
          select: { classes: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(subjects);
  } catch (err) {
    console.error('Error fetching subjects:', err);
    return errorResponse('Gagal mengambil data mata pelajaran', 500);
  }
}

export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const validation = createSubjectSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(validation.error.issues[0]?.message || 'Input tidak valid', 400);
    }

    const { name, level, description } = validation.data;

    const existingSubject = await prisma.subject.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });

    if (existingSubject) {
      return errorResponse('Mata pelajaran dengan nama ini sudah ada', 400);
    }

    const subject = await prisma.subject.create({
      data: { name, level, description },
      include: {
        _count: {
          select: { classes: true },
        },
      },
    });

    return successResponse(subject, 201);
  } catch (err) {
    console.error('Error creating subject:', err);
    return errorResponse('Gagal membuat mata pelajaran', 500);
  }
}
