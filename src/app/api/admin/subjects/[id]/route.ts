import { requireAdmin, successResponse, errorResponse } from '@/lib/utils';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateSubjectSchema = z.object({
  name: z.string().min(1, 'Nama mata pelajaran wajib diisi').optional(),
  level: z.string().optional(),
  description: z.string().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;

    const subject = await prisma.subject.findUnique({
      where: { id },
      include: {
        classes: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!subject) {
      return errorResponse('Mata pelajaran tidak ditemukan', 404);
    }

    return successResponse(subject);
  } catch (err) {
    console.error('Error fetching subject:', err);
    return errorResponse('Gagal mengambil data mata pelajaran', 500);
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
    const validation = updateSubjectSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(validation.error.issues[0]?.message || 'Input tidak valid', 400);
    }

    const existing = await prisma.subject.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse('Mata pelajaran tidak ditemukan', 404);
    }

    const { name, level, description } = validation.data;

    if (name) {
      const duplicate = await prisma.subject.findFirst({
        where: {
          name: { equals: name, mode: 'insensitive' },
          id: { not: id },
        },
      });

      if (duplicate) {
        return errorResponse('Mata pelajaran dengan nama ini sudah ada', 400);
      }
    }

    const subject = await prisma.subject.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(level !== undefined && { level }),
        ...(description !== undefined && { description }),
      },
      include: {
        classes: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return successResponse(subject);
  } catch (err) {
    console.error('Error updating subject:', err);
    return errorResponse('Gagal mengupdate mata pelajaran', 500);
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

    const existing = await prisma.subject.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse('Mata pelajaran tidak ditemukan', 404);
    }

    await prisma.subject.delete({ where: { id } });

    return successResponse({ message: 'Mata pelajaran berhasil dihapus' });
  } catch (err) {
    console.error('Error deleting subject:', err);
    return errorResponse('Gagal menghapus mata pelajaran', 500);
  }
}
