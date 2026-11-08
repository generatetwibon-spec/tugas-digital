import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/utils';
import { uploadToSupabaseStorage } from '@/lib/supabase';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'assets';

    if (!file) {
      return NextResponse.json(
        { error: 'File tidak ditemukan' },
        { status: 400 }
      );
    }

    // Allowed types: images only for assets
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Hanya format gambar yang didukung (JPG, PNG, WEBP)' },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Ukuran file gambar maksimal 5MB' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let fileUrl = '';

    try {
      const result = await uploadToSupabaseStorage(
        buffer,
        file.name,
        file.type,
        folder
      );
      fileUrl = result.url;
    } catch (storageErr) {
      console.warn('Fallback to local public uploads:', storageErr);
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadDir, { recursive: true });

      const ext = path.extname(file.name) || '.png';
      const cleanBase = path.basename(file.name, ext).replace(/[^a-zA-Z0-9-_]/g, '_');
      const uniqueName = `banner_${Date.now()}_${cleanBase}${ext}`;
      await writeFile(path.join(uploadDir, uniqueName), buffer);
      fileUrl = `/uploads/${uniqueName}`;
    }

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName: file.name,
    });
  } catch (err: any) {
    console.error('Error in admin upload:', err);
    return NextResponse.json(
      { error: err.message || 'Gagal mengunggah file' },
      { status: 500 }
    );
  }
}
