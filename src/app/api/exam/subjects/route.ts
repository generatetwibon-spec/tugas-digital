import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Cari mata kuliah yang memiliki minimal 1 kelas dengan ujian yang aktif
    const subjects = await prisma.subject.findMany({
      where: {
        classes: {
          some: {
            exams: {
              some: {
                isActive: true,
              },
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({ subjects });
  } catch (error) {
    console.error('Error fetching exam subjects:', error);
    return NextResponse.json(
      { error: 'Gagal memuat daftar mata kuliah' },
      { status: 500 }
    );
  }
}
