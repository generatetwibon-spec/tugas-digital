const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default admin
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const admin = await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: hashedPassword,
      name: 'Dosen Admin',
    },
  });

  console.log('✅ Admin created:', admin.username);
  console.log('   Username: admin');
  console.log('   Password: admin123');

  // Create or upsert default landing setting
  await prisma.landingSetting.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      universityName: 'Fakultas Ilmu Komputer & Teknologi',
      portalTitle: 'Portal Ujian & Penugasan Digital',
      portalSubtitle: 'Platform Evaluasi Akademik Mahasiswa Terintegrasi',
      announcementTitle: 'Petunjuk & Tata Tertib Pelaksanaan Ujian',
      announcementBody: '1. Pastikan koneksi internet stabil selama pengerjaan.\n2. Masukkan NIM yang valid untuk memuat identitas dan kelas secara otomatis.\n3. Dilarang melakukan kecurangan (copy-paste dinonaktifkan demi integritas akademik).\n4. Jika batas waktu habis, lembar jawaban akan otomatis dikumpulkan ke sistem.',
    },
  });

  console.log('✅ Default Landing Setting created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
