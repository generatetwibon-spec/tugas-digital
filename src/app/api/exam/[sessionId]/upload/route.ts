import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadToSupabaseStorage } from '@/lib/supabase';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    const session = await prisma.examSession.findUnique({
      where: { id: sessionId },
      select: { id: true, submittedAt: true, examId: true },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Sesi ujian tidak ditemukan' },
        { status: 404 }
      );
    }

    if (session.submittedAt) {
      return NextResponse.json(
        { error: 'Ujian sudah dikumpulkan, tidak dapat mengunggah file' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const questionId = formData.get('questionId') as string | null;

    if (!file || !questionId) {
      return NextResponse.json(
        { error: 'File dan questionId wajib dikirim' },
        { status: 400 }
      );
    }

    // Validasi tipe file
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'image/webp',
      'application/pdf',
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Format file tidak didukung. Harap unggah gambar (JPG, PNG, WEBP) atau PDF.' },
        { status: 400 }
      );
    }

    // Validasi ukuran (maks 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Ukuran file melebihi batas maksimal 10MB' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let fileUrl = '';

    // Coba upload ke Supabase Storage terlebih dahulu
    try {
      const uploadResult = await uploadToSupabaseStorage(
        buffer,
        file.name,
        file.type,
        `answers/${sessionId}`
      );
      fileUrl = uploadResult.url;
    } catch (storageError) {
      console.warn('Gagal upload ke Supabase Storage, menggunakan fallback disk lokal:', storageError);
      // Fallback ke penyimpanan lokal jika Supabase ada kendala
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadDir, { recursive: true });

      const ext = path.extname(file.name) || '.png';
      const cleanBaseName = path
        .basename(file.name, ext)
        .replace(/[^a-zA-Z0-9-_]/g, '_');
      const uniqueFileName = `${Date.now()}_${cleanBaseName}${ext}`;
      const filePath = path.join(uploadDir, uniqueFileName);

      await writeFile(filePath, buffer);
      fileUrl = `/uploads/${uniqueFileName}`;
    }

    // Update / Upsert Answer
    const answer = await prisma.answer.upsert({
      where: {
        sessionId_questionId: {
          sessionId,
          questionId,
        },
      },
      update: {
        fileUrl,
        fileName: file.name,
      },
      create: {
        sessionId,
        questionId,
        answer: '',
        fileUrl,
        fileName: file.name,
      },
    });

    return NextResponse.json({
      success: true,
      fileUrl,
      fileName: file.name,
      answerId: answer.id,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Gagal mengunggah file' },
      { status: 500 }
    );
  }
}
