import { requireAdmin, successResponse, errorResponse } from '@/lib/utils';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateExamSchema = z.object({
  title: z.string().min(1, 'Judul ujian wajib diisi').optional(),
  subjectName: z.string().optional(),
  durationMinutes: z.number().int().min(1, 'Durasi minimal 1 menit').optional(),
  minWords: z.number().int().min(0, 'Minimal kata tidak boleh negatif').optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;

    const exam = await prisma.exam.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
        class: {
          include: {
            subject: true,
          },
        },
      },
    });

    if (!exam) {
      return errorResponse('Ujian tidak ditemukan', 404);
    }

    return successResponse(exam);
  } catch (err) {
    console.error('Error fetching exam:', err);
    return errorResponse('Gagal mengambil data ujian', 500);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();
    const validation = updateExamSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(validation.error.issues[0]?.message || 'Input tidak valid', 400);
    }

    const existing = await prisma.exam.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse('Ujian tidak ditemukan', 404);
    }

    const { title, subjectName, durationMinutes, minWords, isActive } = validation.data;

    const exam = await prisma.exam.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(subjectName !== undefined && { subjectName: subjectName.trim() || null }),
        ...(durationMinutes !== undefined && { durationMinutes }),
        ...(minWords !== undefined && { minWords }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
        class: {
          include: {
            subject: true,
          },
        },
      },
    });

    return successResponse(exam);
  } catch (err) {
    console.error('Error updating exam:', err);
    return errorResponse('Gagal mengupdate ujian', 500);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;

    const existing = await prisma.exam.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse('Ujian tidak ditemukan', 404);
    }

    await prisma.exam.delete({ where: { id } });

    return successResponse({ message: 'Ujian berhasil dihapus' });
  } catch (err) {
    console.error('Error deleting exam:', err);
    return errorResponse('Gagal menghapus ujian', 500);
  }
}
