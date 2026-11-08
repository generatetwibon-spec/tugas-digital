import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Supabase URL atau Key belum disetel di file .env');
}

/**
 * Supabase Admin Client dengan Service Role Key
 * Digunakan untuk operasi server-side (upload file, bypass RLS)
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export const BUCKET_NAME = 'exam-attachments';

/**
 * Upload file buffer ke Supabase Storage Bucket
 * @param fileBuffer Buffer isi file
 * @param fileName Nama file (akan dibuat unik)
 * @param mimeType MIME type file
 * @param folder Subfolder opsional di bucket (misal: 'answers', 'banners')
 */
export async function uploadToSupabaseStorage(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  folder: string = 'answers'
): Promise<{ url: string; path: string }> {
  const cleanName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const uniquePath = `${folder}/${Date.now()}_${cleanName}`;

  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .upload(uniquePath, fileBuffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) {
    throw new Error(`Gagal upload ke Supabase Storage: ${error.message}`);
  }

  const { data: publicData } = supabaseAdmin.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);

  return {
    url: publicData.publicUrl,
    path: data.path,
  };
}
