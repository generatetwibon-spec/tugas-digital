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
              where: {
                OR: [
                  { isActive: true },
                  { startTime: { not: null } },
                ],
              },
              select: {
                id: true,
                title: true,
                subjectName: true,
                durationMinutes: true,
                minWords: true,
                isActive: true,
                startTime: true,
                endTime: true,
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

    // Periksa apakah mahasiswa memiliki izin mengikuti ujian (kehadiran cukup)
    const allowedStudents = students.filter((s) => s.isAllowed !== false);
    const hasDisallowed = students.some((s) => s.isAllowed === false);

    if (allowedStudents.length === 0) {
      const reason =
        students[0].allowExamReason ||
        'Kehadiran Anda tidak mencukupi batas minimum / status ditangguhkan oleh dosen pengampu.';
      return NextResponse.json({
        found: true,
        isAllowed: false,
        studentName,
        studentNim: students[0].nim,
        message: reason,
        availableExams: [],
      });
    }

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
      startTime: string | null;
      endTime: string | null;
      scheduleState: 'open' | 'upcoming' | 'ended';
      scheduleMessage: string | null;
    }[] = [];

    // Cek sesi ujian yang sudah pernah dibuat oleh mahasiswa ini
    const examIds = allowedStudents.flatMap((s) => s.class.exams.map((e) => e.id));
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

    const now = new Date();

    for (const s of allowedStudents) {
      for (const exam of s.class.exams) {
        const session = existingSessions.find((sess) => sess.examId === exam.id);
        const status = !session
          ? 'belum'
          : session.submittedAt
          ? 'selesai'
          : 'sedang_mengerjakan';

        // Hitung status jadwal
        let scheduleState: 'open' | 'upcoming' | 'ended' = 'open';
        let scheduleMessage: string | null = null;

        if (exam.startTime && now < new Date(exam.startTime)) {
          scheduleState = 'upcoming';
          const timeStr = new Date(exam.startTime).toLocaleString('id-ID', {
            dateStyle: 'medium',
            timeStyle: 'short',
          });
          scheduleMessage = `Ujian belum dibuka. Dijadwalkan mulai: ${timeStr} WIB`;
        } else if (exam.endTime && now > new Date(exam.endTime)) {
          scheduleState = 'ended';
          const timeStr = new Date(exam.endTime).toLocaleString('id-ID', {
            dateStyle: 'medium',
            timeStyle: 'short',
          });
          scheduleMessage = `Waktu pelaksanaan ujian telah berakhir pada ${timeStr} WIB`;
        } else if (!exam.startTime && !exam.endTime && !exam.isActive) {
          scheduleState = 'ended';
          scheduleMessage = 'Ujian sedang ditutup oleh dosen.';
        }

        availableExams.push({
          examId: exam.id,
          examTitle: exam.title,
          durationMinutes: exam.durationMinutes,
          minWords: exam.minWords,
          totalQuestions: exam._count.questions,
          className: s.class.name,
          classId: s.class.id,
          subjectName: exam.subjectName || s.class.subject?.name || 'Mata Kuliah Umum',
          subjectLevel: s.class.level || s.class.subject?.level || null,
          status,
          sessionId: session?.id,
          startTime: exam.startTime ? exam.startTime.toISOString() : null,
          endTime: exam.endTime ? exam.endTime.toISOString() : null,
          scheduleState,
          scheduleMessage,
        });
      }
    }

    return NextResponse.json({
      found: true,
      isAllowed: true,
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
