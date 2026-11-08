import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');

    if (!subjectId) {
      return NextResponse.json(
        { error: 'subjectId harus disertakan' },
        { status: 400 }
      );
    }

    const classes = await prisma.class.findMany({
      where: {
        subjectId,
        exams: {
          some: {
            isActive: true,
          },
        },
      },
      select: {
        id: true,
        name: true,
        exams: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            title: true,
            durationMinutes: true,
            minWords: true,
          },
          take: 1,
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    const formattedClasses = classes.map((c) => ({
      id: c.id,
      name: c.name,
      activeExam: c.exams[0] || null,
    }));

    return NextResponse.json({ classes: formattedClasses });
  } catch (error) {
    console.error('Error fetching exam classes:', error);
    return NextResponse.json(
      { error: 'Gagal memuat daftar kelas' },
      { status: 500 }
    );
  }
}
