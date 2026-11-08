import Link from "next/link";
import {
  GraduationCap,
  ShieldCheck,
  Clock,
  FileEdit,
  ArrowRight,
  Lock,
  Info,
  CheckCircle2,
} from "lucide-react";
import { prisma } from "@/lib/prisma";

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

  const universityName = setting?.universityName || "Fakultas Ilmu Komputer & Teknologi";
  const portalTitle = setting?.portalTitle || "Portal Ujian & Penugasan Digital";
  const portalSubtitle =
    setting?.portalSubtitle ||
    "Pelaksanaan Evaluasi Akademik Mahasiswa Terstruktur & Terintegrasi";
  const announcementTitle =
    setting?.announcementTitle || "Petunjuk & Tata Tertib Pelaksanaan Ujian";
  const announcementBody =
    setting?.announcementBody ||
    "1. Pastikan koneksi internet stabil.\n2. Masukkan NIM Anda untuk verifikasi identitas.\n3. Kerjakan dengan mandiri dan teliti.";
  const bannerImageUrl = setting?.bannerImageUrl;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-800">
      {/* Top Navbar */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-sm font-bold">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-base sm:text-lg tracking-tight text-slate-900 block leading-tight">
                {portalTitle}
              </span>
              <span className="text-xs text-slate-500 font-medium truncate block max-w-xs sm:max-w-md">
                {universityName}
              </span>
            </div>
          </div>

          <Link
            href="/admin/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50 transition-colors"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Portal Dosen</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center py-12 px-4 sm:px-6">
        <div className="max-w-3xl w-full text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            Evaluasi Akademik Online
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {portalTitle}
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {portalSubtitle}
          </p>

          {/* Banner Image jika diatur oleh dosen */}
          {bannerImageUrl && (
            <div className="w-full max-w-2xl mx-auto rounded-2xl overflow-hidden border border-slate-200 shadow-sm mt-4">
              <img
                src={bannerImageUrl}
                alt="Banner Kampus"
                className="w-full h-48 sm:h-64 object-cover"
              />
            </div>
          )}

          <div className="pt-2">
            <Link
              href="/exam/register"
              className="inline-flex items-center gap-3 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-8 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all text-base transform active:scale-[0.99]"
            >
              <span>Mulai Masuk & Kerjakan Soal</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="text-xs text-slate-400 mt-2">
              Cukup siapkan NIM Anda yang telah didaftarkan di kelas.
            </p>
          </div>

          {/* Pengumuman & Petunjuk Dosen */}
          <div className="mt-8 text-left bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Info className="w-4 h-4 text-emerald-700" />
              <span>{announcementTitle}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-wrap font-sans">
              {announcementBody}
            </p>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-3 gap-5 mt-12">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <FileEdit className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">
              Essay & Lampiran Diagram
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Jawab soal essay secara terstruktur dan sertakan unggahan diagram/gambar jika diwajibkan oleh dosen.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">
              Timer & Auto-Save Realtime
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Waktu pengerjaan terpantau langsung. Jawaban otomatis tersimpan secara berkala ke database.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">
              Unduh Salinan PDF
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Setelah selesai mengerjakan, mahasiswa maupun dosen dapat langsung mengunduh lembar jawaban dalam format PDF.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>&copy; 2026 {universityName}. Hak Cipta Dilindungi.</span>
          <span>Sistem Ujian Digital Akademik</span>
        </div>
      </footer>
    </div>
  );
}
