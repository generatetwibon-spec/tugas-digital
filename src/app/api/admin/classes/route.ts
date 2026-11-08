import { requireAdmin, successResponse, errorResponse } from '@/lib/utils';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createClassSchema = z.object({
  name: z.string().min(1, 'Nama kelas wajib diisi'),
  subjectId: z.string().min(1, 'ID mata pelajaran wajib diisi'),
});

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');

    if (!subjectId) {
      return errorResponse('Parameter subjectId wajib diisi', 400);
    }

    const classes = await prisma.class.findMany({
      where: { subjectId },
      include: {
        subject: true,
        _count: {
          select: { exams: true, students: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(classes);
  } catch (err) {
    console.error('Error fetching classes:', err);
    return errorResponse('Gagal mengambil data kelas', 500);
  }
}

export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const validation = createClassSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(validation.error.issues[0]?.message || 'Input tidak valid', 400);
    }

    const { name, subjectId } = validation.data;

    const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject) {
      return errorResponse('Mata pelajaran tidak ditemukan', 404);
    }

    const existingClass = await prisma.class.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        subjectId,
      },
    });

    if (existingClass) {
      return errorResponse('Kelas dengan nama ini sudah ada di mata pelajaran ini', 400);
    }

    const newClass = await prisma.class.create({
      data: { name, subjectId },
      include: {
        subject: true,
        _count: {
          select: { exams: true, students: true },
        },
      },
    });

    return successResponse(newClass, 201);
  } catch (err) {
    console.error('Error creating class:', err);
    return errorResponse('Gagal membuat kelas', 500);
  }
}
