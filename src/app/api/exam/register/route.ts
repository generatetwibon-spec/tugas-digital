import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/utils';
import { z } from 'zod';

const registerSchema = z.object({
  studentName: z.string().min(1, 'Nama mahasiswa wajib diisi'),
  studentNim: z.string().min(1, 'NIM mahasiswa wajib diisi'),
  examId: z.string().min(1, 'ID ujian wajib diisi'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(validation.error.issues[0]?.message || 'Input tidak valid', 400);
    }

    const { studentName, studentNim, examId } = validation.data;

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          select: { id: true },
        },
        _count: {
          select: { questions: true },
        },
      },
    });

    if (!exam) {
      return errorResponse('Ujian tidak ditemukan', 404);
    }

    if (!exam.isActive) {
      return errorResponse('Ujian ini tidak aktif', 400);
    }

    const existingSession = await prisma.examSession.findFirst({
      where: {
        examId,
        studentNim,
      },
    });

    if (existingSession) {
      if (existingSession.submittedAt) {
        return errorResponse('Anda sudah mengerjakan ujian ini', 400);
      }

      return successResponse({
        sessionId: existingSession.id,
        examTitle: exam.title,
        durationMinutes: exam.durationMinutes,
        totalQuestions: exam._count.questions,
        startedAt: existingSession.startedAt,
        message: 'Melanjutkan sesi ujian yang ada',
      });
    }

    const headers = request.headers;
    const ipAddress =
      headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      headers.get('x-real-ip') ||
      'unknown';
    const userAgent = headers.get('user-agent') || 'unknown';

    const session = await prisma.examSession.create({
      data: {
        examId,
        studentName,
        studentNim,
        ipAddress,
        userAgent,
        answers: {
          create: exam.questions.map((question) => ({
            questionId: question.id,
            answer: '',
            wordCount: 0,
          })),
        },
      },
    });

    return successResponse(
      {
        sessionId: session.id,
        examTitle: exam.title,
        durationMinutes: exam.durationMinutes,
        totalQuestions: exam._count.questions,
        startedAt: session.startedAt,
        message: 'Berhasil mendaftar ujian',
      },
      201
    );
  } catch (err) {
    console.error('Error registering for exam:', err);
    return errorResponse('Gagal mendaftar ujian', 500);
  }
}
