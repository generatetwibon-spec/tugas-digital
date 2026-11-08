import { requireAdmin, successResponse, errorResponse } from '@/lib/utils';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createQuestionSchema = z.object({
  examId: z.string().min(1, 'ID ujian wajib diisi'),
  text: z.string().min(1, 'Teks soal wajib diisi'),
  order: z.number().int().min(1).optional(),
  points: z.number().int().min(1, 'Poin minimal 1').default(10),
  allowFileUpload: z.boolean().optional().default(false),
  fileRequired: z.boolean().optional().default(false),
});

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const examId = searchParams.get('examId');

    if (!examId) {
      return errorResponse('Parameter examId wajib diisi', 400);
    }

    const questions = await prisma.question.findMany({
      where: { examId },
      orderBy: { order: 'asc' },
    });

    return successResponse(questions);
  } catch (err) {
    console.error('Error fetching questions:', err);
    return errorResponse('Gagal mengambil data soal', 500);
  }
}

export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const validation = createQuestionSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(validation.error.issues[0]?.message || 'Input tidak valid', 400);
    }

    const { examId, text, order, points, allowFileUpload, fileRequired } = validation.data;

    const exam = await prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) {
      return errorResponse('Ujian tidak ditemukan', 404);
    }

    let questionOrder = order;

    if (!questionOrder) {
      const maxOrderQuestion = await prisma.question.findFirst({
        where: { examId },
        orderBy: { order: 'desc' },
        select: { order: true },
      });

      questionOrder = (maxOrderQuestion?.order ?? 0) + 1;
    }

    const question = await prisma.question.create({
      data: {
        examId,
        text,
        order: questionOrder,
        points,
        allowFileUpload: Boolean(allowFileUpload),
        fileRequired: Boolean(fileRequired),
      },
    });

    return successResponse(question, 201);
  } catch (err) {
    console.error('Error creating question:', err);
    return errorResponse('Gagal membuat soal', 500);
  }
}
