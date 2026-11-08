import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/utils';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    const session = await prisma.examSession.findUnique({
      where: { id: sessionId },
      include: {
        exam: {
          include: {
            questions: {
              orderBy: { order: 'asc' },
              select: {
                id: true,
                text: true,
                order: true,
                points: true,
                allowFileUpload: true,
                fileRequired: true,
              },
            },
          },
        },
        answers: {
          select: {
            id: true,
            questionId: true,
            answer: true,
            wordCount: true,
            fileUrl: true,
            fileName: true,
          },
        },
      },
    });

    if (!session) {
      return errorResponse('Sesi ujian tidak ditemukan', 404);
    }

    const questionsWithAnswers = session.exam.questions.map((question) => {
      const existingAnswer = session.answers.find(
        (a) => a.questionId === question.id
      );

      return {
        ...question,
        answer: existingAnswer
          ? {
              id: existingAnswer.id,
              answer: existingAnswer.answer,
              wordCount: existingAnswer.wordCount,
              fileUrl: existingAnswer.fileUrl,
              fileName: existingAnswer.fileName,
            }
          : null,
      };
    });

    return successResponse({
      examTitle: session.exam.title,
      durationMinutes: session.exam.durationMinutes,
      minWords: session.exam.minWords,
      startedAt: session.startedAt,
      submittedAt: session.submittedAt ? session.submittedAt.toISOString() : null,
      studentName: session.studentName,
      studentNim: session.studentNim,
      questions: questionsWithAnswers,
    });
  } catch (err) {
    console.error('Error fetching exam questions:', err);
    return errorResponse('Gagal mengambil soal ujian', 500);
  }
}
