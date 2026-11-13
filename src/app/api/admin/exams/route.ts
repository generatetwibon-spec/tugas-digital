import { requireAdmin, successResponse, errorResponse } from '@/lib/utils';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createExamSchema = z.object({
  title: z.string().min(1, 'Judul ujian wajib diisi'),
  subjectName: z.string().optional(),
  classId: z.string().min(1, 'ID kelas wajib diisi'),
  durationMinutes: z.number().int().min(1, 'Durasi minimal 1 menit'),
  minWords: z.number().int().min(0, 'Minimal kata tidak boleh negatif').default(0),
  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),
});

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');

    if (!classId) {
      return errorResponse('Parameter classId wajib diisi', 400);
    }

    const exams = await prisma.exam.findMany({
      where: { classId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { questions: true, sessions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(exams);
  } catch (err) {
    console.error('Error fetching exams:', err);
    return errorResponse('Gagal mengambil data ujian', 500);
  }
}

export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const validation = createExamSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(validation.error.issues[0]?.message || 'Input tidak valid', 400);
    }

    const { title, subjectName, classId, durationMinutes, minWords, startTime, endTime } = validation.data;

    const classData = await prisma.class.findUnique({ where: { id: classId } });
    if (!classData) {
      return errorResponse('Kelas tidak ditemukan', 404);
    }

    const exam = await prisma.exam.create({
      data: {
        title: title.trim(),
        subjectName: subjectName?.trim() || null,
        classId,
        durationMinutes,
        minWords,
        startTime: startTime ? new Date(startTime) : null,
        endTime: endTime ? new Date(endTime) : null,
        isActive: !startTime && !endTime ? false : true,
      },
      include: {
        _count: {
          select: { questions: true, sessions: true },
        },
      },
    });

    return successResponse(exam, 201);
  } catch (err) {
    console.error('Error creating exam:', err);
    return errorResponse('Gagal membuat ujian', 500);
  }
}
