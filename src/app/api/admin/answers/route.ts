import { requireAdmin, successResponse, errorResponse } from '@/lib/utils';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const examId = searchParams.get('examId');

    if (!examId) {
      return errorResponse('Parameter examId wajib diisi', 400);
    }

    const exam = await prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) {
      return errorResponse('Ujian tidak ditemukan', 404);
    }

    const sessions = await prisma.examSession.findMany({
      where: { examId },
      include: {
        answers: {
          include: {
            question: {
              select: {
                id: true,
                text: true,
                order: true,
                points: true,
              },
            },
          },
          orderBy: {
            question: { order: 'asc' },
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    return successResponse(sessions);
  } catch (err) {
    console.error('Error fetching answers:', err);
    return errorResponse('Gagal mengambil data jawaban', 500);
  }
}

/**
 * Reset / Hapus sesi ujian mahasiswa
 * Berguna untuk pengujian atau jika mahasiswa laptopnya mati/berkendala dan diberi izin mengerjakan ulang
 */
export async function DELETE(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return errorResponse('Parameter sessionId wajib disertakan', 400);
    }

    const session = await prisma.examSession.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        studentName: true,
        studentNim: true,
      },
    });

    if (!session) {
      return errorResponse('Sesi ujian tidak ditemukan', 404);
    }

    // Delete session (answers will cascade delete)
    await prisma.examSession.delete({
      where: { id: sessionId },
    });

    return successResponse({
      message: `Sesi ujian mahasiswa ${session.studentName} (${session.studentNim}) berhasil direset`,
    });
  } catch (err) {
    console.error('Error deleting exam session:', err);
    return errorResponse('Gagal mereset sesi ujian', 500);
  }
}
