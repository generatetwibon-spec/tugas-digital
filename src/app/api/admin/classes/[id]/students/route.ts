import { requireAdmin, successResponse, errorResponse } from '@/lib/utils';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const addStudentSchema = z.object({
  nim: z.string().optional(),
  name: z.string().optional(),
  bulkText: z.string().optional(), // Mendukung paste massal dari Excel: "2101001, Ahmad Fauzi"
});

const editStudentSchema = z.object({
  studentId: z.string().min(1, 'ID mahasiswa wajib diisi'),
  nim: z.string().min(1, 'NIM mahasiswa wajib diisi'),
  name: z.string().min(1, 'Nama mahasiswa wajib diisi'),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id: classId } = await params;

    const classData = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        students: {
          orderBy: { name: 'asc' },
        },
        exams: {
          select: {
            id: true,
            title: true,
            isActive: true,
          },
        },
      },
    });

    if (!classData) {
      return errorResponse('Kelas tidak ditemukan', 404);
    }

    // Ambil riwayat pengerjaan semua mahasiswa di kelas ini
    const examIds = classData.exams.map((e) => e.id);
    const sessions = await prisma.examSession.findMany({
      where: {
        examId: { in: examIds },
      },
      select: {
        id: true,
        examId: true,
        studentNim: true,
        studentName: true,
        submittedAt: true,
        startedAt: true,
      },
    });

    // Gabungkan status pengerjaan ke tiap mahasiswa
    const studentsWithStatus = classData.students.map((student) => {
      const studentSessions = sessions.filter(
        (s) => s.studentNim.toLowerCase() === student.nim.toLowerCase()
      );

      return {
        id: student.id,
        nim: student.nim,
        name: student.name,
        createdAt: student.createdAt,
        examsStatus: classData.exams.map((exam) => {
          const session = studentSessions.find((s) => s.examId === exam.id);
          return {
            examId: exam.id,
            examTitle: exam.title,
            status: !session
              ? 'belum'
              : session.submittedAt
              ? 'selesai'
              : 'sedang_mengerjakan',
            submittedAt: session?.submittedAt || null,
            sessionId: session?.id || null,
          };
        }),
      };
    });

    return successResponse({
      className: classData.name,
      exams: classData.exams,
      students: studentsWithStatus,
    });
  } catch (err) {
    console.error('Error fetching students:', err);
    return errorResponse('Gagal mengambil data mahasiswa', 500);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id: classId } = await params;
    const body = await request.json();
    const validation = addStudentSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(validation.error.issues[0]?.message || 'Input tidak valid', 400);
    }

    const { nim, name, bulkText } = validation.data;

    // Jika input massal (bulk text)
    if (bulkText && bulkText.trim()) {
      const lines = bulkText.split('\n');
      const studentsToInsert: { nim: string; name: string; classId: string }[] = [];

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // Split berdasarkan koma, tab, atau titik koma
        const parts = trimmed.split(/[\t,;]+/).map((p) => p.trim());
        if (parts.length >= 2) {
          const sNim = parts[0];
          const sName = parts.slice(1).join(' ');
          if (sNim && sName) {
            studentsToInsert.push({ nim: sNim, name: sName, classId });
          }
        }
      }

      if (studentsToInsert.length === 0) {
        return errorResponse('Format data massal tidak valid. Gunakan format: NIM, Nama (1 baris per mahasiswa)', 400);
      }

      // Upsert mahasiswa massal
      let addedCount = 0;
      for (const s of studentsToInsert) {
        await prisma.student.upsert({
          where: {
            classId_nim: {
              classId,
              nim: s.nim,
            },
          },
          update: { name: s.name },
          create: s,
        });
        addedCount++;
      }

      return successResponse({
        message: `Berhasil menambahkan / memperbarui ${addedCount} mahasiswa`,
        count: addedCount,
      });
    }

    // Input satu mahasiswa
    if (!nim || !name) {
      return errorResponse('NIM dan Nama mahasiswa wajib diisi', 400);
    }

    const student = await prisma.student.upsert({
      where: {
        classId_nim: {
          classId,
          nim: nim.trim(),
        },
      },
      update: { name: name.trim() },
      create: {
        classId,
        nim: nim.trim(),
        name: name.trim(),
      },
    });

    return successResponse(student, 201);
  } catch (err) {
    console.error('Error saving student:', err);
    return errorResponse('Gagal menyimpan data mahasiswa', 500);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id: classId } = await params;
    const body = await request.json();
    const validation = editStudentSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(validation.error.issues[0]?.message || 'Input tidak valid', 400);
    }

    const { studentId, nim, name } = validation.data;

    // Cek apakah mahasiswa ada di kelas ini
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student || student.classId !== classId) {
      return errorResponse('Mahasiswa tidak ditemukan di kelas ini', 404);
    }

    // Cek konflik NIM di kelas yang sama
    const duplicate = await prisma.student.findFirst({
      where: {
        classId,
        nim: nim.trim(),
        id: { not: studentId },
      },
    });

    if (duplicate) {
      return errorResponse('NIM ini sudah digunakan oleh mahasiswa lain di kelas ini', 400);
    }

    const updated = await prisma.student.update({
      where: { id: studentId },
      data: {
        nim: nim.trim(),
        name: name.trim(),
      },
    });

    return successResponse(updated);
  } catch (err) {
    console.error('Error updating student:', err);
    return errorResponse('Gagal memperbarui data mahasiswa', 500);
  }
}

export async function DELETE(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return errorResponse('Parameter studentId wajib disertakan', 400);
    }

    await prisma.student.delete({
      where: { id: studentId },
    });

    return successResponse({ message: 'Mahasiswa berhasil dihapus' });
  } catch (err) {
    console.error('Error deleting student:', err);
    return errorResponse('Gagal menghapus mahasiswa', 500);
  }
}
