import { prisma } from "@/lib/prisma";
import StudentPortalLanding from "@/components/StudentPortalLanding";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let setting = null;
  try {
    setting = await prisma.landingSetting.findUnique({
      where: { id: "default" },
    });
  } catch (e) {
    // fallback if db during build
  }

  const universityName =
    setting?.universityName || "Fakultas Tarbiyah dan Ilmu Keguruan (FTIK)";
  const portalTitle =
    setting?.portalTitle || "Portal Ujian & Penugasan Digital";
  const portalSubtitle =
    setting?.portalSubtitle || "Platform Evaluasi Akademik Mahasiswa Terintegrasi";
  const announcementTitle =
    setting?.announcementTitle || "Petunjuk & Tata Tertib Pelaksanaan Ujian";
  const announcementBody =
    setting?.announcementBody ||
    "1. Pastikan koneksi internet stabil selama pengerjaan.\n2. Masukkan NIM yang valid untuk memuat identitas dan kelas secara otomatis.\n3. Dilarang melakukan kecurangan (sistem dilengkapi proteksi anti-contek dan anti-inspect).\n4. Jika batas waktu habis, lembar jawaban akan otomatis dikumpulkan ke sistem.";

  return (
    <StudentPortalLanding
      universityName={universityName}
      portalTitle={portalTitle}
      portalSubtitle={portalSubtitle}
      announcementTitle={announcementTitle}
      announcementBody={announcementBody}
    />
  );
}
