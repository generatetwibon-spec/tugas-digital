const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jmvhgqbgzdagkddkrnls.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing Supabase with URL:', supabaseUrl);
console.log('Key exists:', !!supabaseKey);

const supabase = createClient(supabaseUrl, supabaseKey);

async function initStorage() {
  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
      console.error('Error listing buckets:', listError);
      return;
    }
    console.log('Existing buckets:', buckets.map(b => b.name));

    const bucketName = 'exam-attachments';
    const exists = buckets.some(b => b.name === bucketName);

    if (!exists) {
      console.log(`Bucket "${bucketName}" does not exist. Creating...`);
      const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf']
      });

      if (createError) {
        console.error('Error creating bucket:', createError);
      } else {
        console.log(`Bucket "${bucketName}" created successfully!`, data);
      }
    } else {
      console.log(`Bucket "${bucketName}" already exists.`);
    }

    // Test upload a small dummy file
    const testFileName = `test_${Date.now()}.txt`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(testFileName, Buffer.from('Hello Supabase Storage from Exam App'), {
        contentType: 'text/plain',
        upsert: true
      });

    if (uploadError) {
      console.error('Test upload failed:', uploadError);
    } else {
      console.log('Test upload succeeded:', uploadData);
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(testFileName);
      console.log('Public URL:', publicUrlData.publicUrl);

      // Clean up test file
      await supabase.storage.from(bucketName).remove([testFileName]);
      console.log('Test file cleaned up.');
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

initStorage();
