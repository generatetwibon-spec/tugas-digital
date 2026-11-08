import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/utils';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    const session = await prisma.examSession.findUnique({
      where: { id: sessionId },
      select: { id: true, submittedAt: true, studentName: true },
    });

    if (!session) {
      return errorResponse('Sesi ujian tidak ditemukan', 404);
    }

    // Idempotent: jika sudah terkumpul (misal klik dobel atau auto-submit bersamaan), tetap respon sukses
    if (session.submittedAt) {
      return successResponse({
        message: 'Ujian sudah berhasil dikumpulkan sebelumnya',
        studentName: session.studentName,
        submittedAt: session.submittedAt.toISOString(),
      });
    }

    const now = new Date();
    await prisma.examSession.update({
      where: { id: sessionId },
      data: { submittedAt: now },
    });

    return successResponse({
      message: 'Ujian berhasil dikumpulkan',
      studentName: session.studentName,
      submittedAt: now.toISOString(),
    });
  } catch (err) {
    console.error('Error submitting exam:', err);
    return errorResponse('Gagal mengumpulkan ujian', 500);
  }
}
