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

    const now = new Date();
    if (exam.startTime && now < new Date(exam.startTime)) {
      const timeStr = new Date(exam.startTime).toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
      return errorResponse(
        `Ujian belum dibuka. Pelaksanaan ujian dijadwalkan pada ${timeStr} WIB.`,
        400
      );
    }

    if (exam.endTime && now > new Date(exam.endTime)) {
      const timeStr = new Date(exam.endTime).toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
      return errorResponse(
        `Waktu pelaksanaan ujian telah berakhir pada ${timeStr} WIB. Pengumpulan lembar jawaban telah ditutup.`,
        400
      );
    }

    if (!exam.startTime && !exam.endTime && !exam.isActive) {
      return errorResponse('Ujian ini sedang tidak aktif / ditutup oleh dosen.', 400);
    }

    // Periksa izin ujian mahasiswa (kehadiran)
    const studentRecord = await prisma.student.findFirst({
      where: {
        classId: exam.classId,
        nim: { equals: studentNim.trim(), mode: 'insensitive' },
      },
    });

    if (studentRecord && studentRecord.isAllowed === false) {
      return errorResponse(
        studentRecord.allowExamReason ||
          'Mohon maaf, Anda belum diperkenankan mengikuti ujian ini karena kehadiran kurang atau status ditangguhkan. Silakan hubungi dosen Anda.',
        403
      );
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
