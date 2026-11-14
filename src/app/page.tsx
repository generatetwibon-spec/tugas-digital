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

  return (
    <StudentPortalLanding
      institutionName={setting?.institutionName || "IAI TABAH LAMONGAN"}
      facultyName={setting?.facultyName || setting?.universityName || "Fakultas Tarbiyah dan Ilmu Keguruan (FTIK)"}
      portalTitle={setting?.portalTitle || "Portal Ujian & Penugasan Digital"}
      portalSubtitle={setting?.portalSubtitle || "Platform Evaluasi Akademik Mahasiswa Terintegrasi"}
      heroHeadline={setting?.heroHeadline || setting?.portalTitle || "Portal Ujian & Penugasan Digital"}
      ctaButtonText={setting?.ctaButtonText || "Mulai Masuk & Kerjakan Soal"}
      ctaHelperText={setting?.ctaHelperText || "Cukup siapkan NIM Anda yang telah didaftarkan di kelas"}
      academicYear={setting?.academicYear || "Tahun Akademik 2026/2027"}
      logoUrl={setting?.logoUrl || null}
      heroImageUrl={setting?.heroImageUrl || null}
      announcementTitle={setting?.announcementTitle || "Petunjuk & Tata Tertib Pelaksanaan Ujian"}
      announcementBody={
        setting?.announcementBody ||
        "1. Pastikan koneksi internet stabil selama pengerjaan.\n2. Masukkan NIM yang valid untuk memuat identitas dan kelas secara otomatis.\n3. Dilarang melakukan kecurangan (sistem dilengkapi proteksi anti-contek dan anti-inspect).\n4. Jika batas waktu habis, lembar jawaban akan otomatis dikumpulkan ke sistem."
      }
      feature1Title={setting?.feature1Title || "Uraian Essay & Lampiran Digital"}
      feature1Desc={
        setting?.feature1Desc ||
        "Tuliskan analisis dan uraian essay secara terstruktur. Lengkapi jawaban dengan unggahan diagram teknis, sketsa kurikulum, atau foto lembar kerja yang otomatis tercetak rapi ke berkas PDF."
      }
      feature2Title={setting?.feature2Title || "Timer Realtime & Auto-Save Cloud"}
      feature2Desc={
        setting?.feature2Desc ||
        "Seluruh ketikan jawaban tersimpan otomatis secara berkala ke cloud. Tidak perlu khawatir apabila koneksi terputus sesaat atau terjadi gangguan perangkat, pengerjaan dapat langsung dilanjutkan."
      }
      feature3Title={setting?.feature3Title || "Unduh Lembar Jawaban PDF Resmi"}
      feature3Desc={
        setting?.feature3Desc ||
        "Begitu ujian selesai dikumpulkan, mahasiswa dan dosen pengampu dapat langsung mengunduh salinan lembar jawaban berformat PDF resmi terverifikasi lengkap dengan waktu submit dan nama mahasiswa."
      }
      footerText={setting?.footerText || "Hak Cipta Dilindungi."}
    />
  );
}
