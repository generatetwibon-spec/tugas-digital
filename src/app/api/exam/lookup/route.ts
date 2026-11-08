import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawNim = searchParams.get('nim');

    if (!rawNim || !rawNim.trim()) {
      return NextResponse.json(
        { error: 'NIM harus disertakan' },
        { status: 400 }
      );
    }

    const nim = rawNim.trim();

    // Cari mahasiswa berdasarkan NIM
    const students = await prisma.student.findMany({
      where: {
        nim: {
          equals: nim,
          mode: 'insensitive',
        },
      },
      include: {
        class: {
          include: {
            subject: true,
            exams: {
              where: { isActive: true },
              select: {
                id: true,
                title: true,
                durationMinutes: true,
                minWords: true,
                _count: {
                  select: { questions: true },
                },
              },
            },
          },
        },
      },
    });

    if (students.length === 0) {
      return NextResponse.json({
        found: false,
        message: 'NIM tidak ditemukan. Pastikan Anda telah didaftarkan oleh dosen pengampu di kelas yang bersangkutan.',
      });
    }

    // Ambil nama mahasiswa dari data pertama
    const studentName = students[0].name;

    // Ambil semua kelas dan penugasan yang tersedia untuk mahasiswa ini
    const availableExams: {
      examId: string;
      examTitle: string;
      durationMinutes: number;
      minWords: number;
      totalQuestions: number;
      className: string;
      classId: string;
      subjectName: string;
      subjectLevel: string | null;
      status: string; // 'belum' | 'sedang' | 'selesai'
      sessionId?: string;
    }[] = [];

    // Cek sesi ujian yang sudah pernah dibuat oleh mahasiswa ini
    const examIds = students.flatMap((s) => s.class.exams.map((e) => e.id));
    const existingSessions = await prisma.examSession.findMany({
      where: {
        examId: { in: examIds },
        studentNim: { equals: nim, mode: 'insensitive' },
      },
      select: {
        id: true,
        examId: true,
        submittedAt: true,
      },
    });

    for (const s of students) {
      for (const exam of s.class.exams) {
        const session = existingSessions.find((sess) => sess.examId === exam.id);
        const status = !session
          ? 'belum'
          : session.submittedAt
          ? 'selesai'
          : 'sedang_mengerjakan';

        availableExams.push({
          examId: exam.id,
          examTitle: exam.title,
          durationMinutes: exam.durationMinutes,
          minWords: exam.minWords,
          totalQuestions: exam._count.questions,
          className: s.class.name,
          classId: s.class.id,
          subjectName: s.class.subject.name,
          subjectLevel: s.class.subject.level,
          status,
          sessionId: session?.id,
        });
      }
    }

    return NextResponse.json({
      found: true,
      studentNim: students[0].nim,
      studentName,
      availableExams,
    });
  } catch (error) {
    console.error('Error in student lookup:', error);
    return NextResponse.json(
      { error: 'Gagal mencari data mahasiswa' },
      { status: 500 }
    );
  }
}
