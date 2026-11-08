import { requireAdmin, successResponse, errorResponse } from '@/lib/utils';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateQuestionSchema = z.object({
  text: z.string().min(1, 'Teks soal wajib diisi').optional(),
  order: z.number().int().min(1).optional(),
  points: z.number().int().min(1, 'Poin minimal 1').optional(),
  allowFileUpload: z.boolean().optional(),
  fileRequired: z.boolean().optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();
    const validation = updateQuestionSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(validation.error.issues[0]?.message || 'Input tidak valid', 400);
    }

    const existing = await prisma.question.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse('Soal tidak ditemukan', 404);
    }

    const { text, order, points, allowFileUpload, fileRequired } = validation.data;

    const question = await prisma.question.update({
      where: { id },
      data: {
        ...(text !== undefined && { text }),
        ...(order !== undefined && { order }),
        ...(points !== undefined && { points }),
        ...(allowFileUpload !== undefined && { allowFileUpload }),
        ...(fileRequired !== undefined && { fileRequired }),
      },
    });

    return successResponse(question);
  } catch (err) {
    console.error('Error updating question:', err);
    return errorResponse('Gagal mengupdate soal', 500);
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

    const existing = await prisma.question.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse('Soal tidak ditemukan', 404);
    }

    await prisma.question.delete({ where: { id } });

    return successResponse({ message: 'Soal berhasil dihapus' });
  } catch (err) {
    console.error('Error deleting question:', err);
    return errorResponse('Gagal menghapus soal', 500);
  }
}
