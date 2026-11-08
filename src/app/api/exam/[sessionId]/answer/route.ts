import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/utils';
import { z } from 'zod';

const saveAnswerSchema = z.object({
  questionId: z.string().min(1, 'ID soal wajib diisi'),
  answer: z.string(),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    const session = await prisma.examSession.findUnique({
      where: { id: sessionId },
      select: { id: true, submittedAt: true, examId: true },
    });

    if (!session) {
      return errorResponse('Sesi ujian tidak ditemukan', 404);
    }

    if (session.submittedAt) {
      return errorResponse('Ujian sudah dikumpulkan, tidak dapat mengubah jawaban', 400);
    }

    const body = await request.json();
    const validation = saveAnswerSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(validation.error.issues[0]?.message || 'Input tidak valid', 400);
    }

    const { questionId, answer } = validation.data;

    const question = await prisma.question.findFirst({
      where: {
        id: questionId,
        examId: session.examId,
      },
    });

    if (!question) {
      return errorResponse('Soal tidak ditemukan dalam ujian ini', 404);
    }

    const wordCount = answer.trim()
      ? answer.trim().split(/\s+/).filter(Boolean).length
      : 0;

    // Atomic Upsert: Mencegah race condition ketika koneksi lambat atau pengetikan cepat
    const savedAnswer = await prisma.answer.upsert({
      where: {
        sessionId_questionId: {
          sessionId,
          questionId,
        },
      },
      update: {
        answer,
        wordCount,
      },
      create: {
        sessionId,
        questionId,
        answer,
        wordCount,
      },
    });

    return successResponse({
      id: savedAnswer.id,
      questionId: savedAnswer.questionId,
      answer: savedAnswer.answer,
      wordCount: savedAnswer.wordCount,
    });
  } catch (err) {
    console.error('Error saving answer:', err);
    return errorResponse('Gagal menyimpan jawaban', 500);
  }
}
