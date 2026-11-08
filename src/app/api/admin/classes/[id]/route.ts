import { requireAdmin, successResponse, errorResponse } from '@/lib/utils';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateClassSchema = z.object({
  name: z.string().min(1, 'Nama kelas wajib diisi'),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;

    const classData = await prisma.class.findUnique({
      where: { id },
      include: {
        subject: true,
        exams: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!classData) {
      return errorResponse('Kelas tidak ditemukan', 404);
    }

    return successResponse(classData);
  } catch (err) {
    console.error('Error fetching class:', err);
    return errorResponse('Gagal mengambil data kelas', 500);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();
    const validation = updateClassSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(validation.error.issues[0]?.message || 'Input tidak valid', 400);
    }

    const existing = await prisma.class.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse('Kelas tidak ditemukan', 404);
    }

    const { name } = validation.data;

    const duplicate = await prisma.class.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        subjectId: existing.subjectId,
        id: { not: id },
      },
    });

    if (duplicate) {
      return errorResponse('Kelas dengan nama ini sudah ada di mata pelajaran ini', 400);
    }

    const updatedClass = await prisma.class.update({
      where: { id },
      data: { name },
      include: {
        subject: true,
        exams: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return successResponse(updatedClass);
  } catch (err) {
    console.error('Error updating class:', err);
    return errorResponse('Gagal mengupdate kelas', 500);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;

    const existing = await prisma.class.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse('Kelas tidak ditemukan', 404);
    }

    await prisma.class.delete({ where: { id } });

    return successResponse({ message: 'Kelas berhasil dihapus' });
  } catch (err) {
    console.error('Error deleting class:', err);
    return errorResponse('Gagal menghapus kelas', 500);
  }
}
