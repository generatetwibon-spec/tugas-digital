import { requireAdmin, successResponse, errorResponse } from '@/lib/utils';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createClassSchema = z.object({
  name: z.string().min(1, 'Nama kelas wajib diisi'),
  level: z.string().optional(),
  description: z.string().optional(),
  subjectId: z.string().optional(),
});

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');

    const whereClause: any = {};
    if (subjectId) {
      whereClause.subjectId = subjectId;
    }

    const classes = await prisma.class.findMany({
      where: whereClause,
      include: {
        subject: true,
        exams: {
          select: {
            id: true,
            title: true,
            subjectName: true,
            isActive: true,
            durationMinutes: true,
            startTime: true,
            endTime: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { exams: true, students: true },
        },
      },
      orderBy: { name: 'asc' },
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

    const { name, level, description, subjectId } = validation.data;

    const existingClass = await prisma.class.findFirst({
      where: {
        name: { equals: name.trim(), mode: 'insensitive' },
      },
    });

    if (existingClass) {
      return errorResponse(`Kelas dengan nama "${name.trim()}" sudah terdaftar`, 400);
    }

    const newClass = await prisma.class.create({
      data: {
        name: name.trim(),
        level: level?.trim() || null,
        description: description?.trim() || null,
        subjectId: subjectId || null,
      },
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
