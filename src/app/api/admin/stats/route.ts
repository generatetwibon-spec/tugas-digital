import { prisma } from "@/lib/prisma";
import { requireAdmin, successResponse, errorResponse } from "@/lib/utils";

export async function GET() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    // Eksekusi paralel 100% via Promise.all untuk kecepatan loading maksimal
    const [
      subjectCount,
      classCount,
      studentCount,
      activeExamCount,
      sessionCount,
      activeExams,
      recentSubmissions,
    ] = await Promise.all([
      prisma.subject.count(),
      prisma.class.count(),
      prisma.student.count(),
      prisma.exam.count({ where: { isActive: true } }),
      prisma.examSession.count({ where: { submittedAt: { not: null } } }),
      prisma.exam.findMany({
        where: { isActive: true },
        include: {
          class: {
            include: {
              subject: true,
            },
          },
          _count: {
            select: { sessions: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
      prisma.examSession.findMany({
        where: { submittedAt: { not: null } },
        orderBy: { submittedAt: "desc" },
        take: 6,
        include: {
          exam: {
            include: {
              class: {
                include: {
                  subject: true,
                },
              },
            },
          },
        },
      }),
    ]);

    return successResponse({
      subjectCount,
      classCount,
      studentCount,
      activeExamCount,
      sessionCount,
      activeExams: activeExams.map((exam: any) => ({
        id: exam.id,
        title: exam.title,
        classId: exam.class.id,
        subjectId: exam.class.subject.id,
        className: exam.class.name,
        subjectName: exam.class.subject.name,
        sessionCount: exam._count.sessions,
        durationMinutes: exam.durationMinutes,
      })),
      recentSubmissions: recentSubmissions.map((s: any) => ({
        id: s.id,
        studentName: s.studentName,
        studentNim: s.studentNim,
        examTitle: s.exam.title,
        subjectName: s.exam.class.subject.name,
        className: s.exam.class.name,
        submittedAt: s.submittedAt,
      })),
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan";
    return errorResponse(message, 500);
  }
}
