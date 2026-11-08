import Link from "next/link";
import {
  GraduationCap,
  ShieldCheck,
  Clock,
  FileEdit,
  ArrowRight,
  Info,
  CheckCircle2,
  Sparkles,
  Lock,
  FileText,
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

  const universityName =
    setting?.universityName || "Fakultas Ilmu Komputer & Teknologi";
  const portalTitle =
    setting?.portalTitle || "Portal Ujian & Penugasan Digital";
  const portalSubtitle =
    setting?.portalSubtitle ||
    "Platform Evaluasi & Penugasan Akademik Mahasiswa Terstruktur, Terintegrasi, dan Berintegritas Tinggi.";
  const announcementTitle =
    setting?.announcementTitle || "Petunjuk & Tata Tertib Pelaksanaan Ujian";
  const announcementBody =
    setting?.announcementBody ||
    "1. Pastikan koneksi internet stabil sebelum memulai ujian.\n2. Masukkan NIM valid Anda untuk memuat identitas dan paket ujian secara otomatis.\n3. Dilarang melakukan kecurangan (sistem dilengkapi proteksi anti-contek otomatis).\n4. Jika batas waktu habis, lembar jawaban akan otomatis dikumpulkan ke sistem.";
  const bannerImageUrl = setting?.bannerImageUrl;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-800">
      {/* Top Navbar */}
      <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-sm font-bold">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 block leading-tight">
                {portalTitle}
              </span>
              <span className="text-xs text-slate-500 font-medium truncate block max-w-xs sm:max-w-md">
                {universityName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Portal Aktif</span>
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section: Lush Gradient & Clear Background Image Inspired by Professional UI/UX */}
      <section className="relative w-full overflow-hidden bg-slate-900 py-20 sm:py-28 lg:py-32 flex items-center justify-center">
        {/* Background Image & Stylish Emerald Gradient Overlays */}
        {bannerImageUrl ? (
          <>
            <img
              src={bannerImageUrl}
              alt="Banner Kampus"
              className="absolute inset-0 w-full h-full object-cover object-center filter brightness-100 contrast-105"
            />
            {/* Emerald Gradient Wash: Rich vibrant green from bottom, transparent at top to keep photo crisp */}
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/95 via-emerald-900/45 via-45% to-black/20" />
            {/* Subtle Radial Glow in Center for Text Readability without Blackening */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(6,78,59,0.4)_0%,_transparent_75%)]" />
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/40 via-transparent to-emerald-950/40" />
          </>
        ) : (
          /* Fallback Stylized Collage Background with Emerald Gradient */
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-emerald-950 to-teal-950">
            {/* Decorative Subtle Glowing Rings & Shapes like Reference Mosaic */}
            <div className="absolute -top-12 -left-12 w-96 h-96 rounded-full bg-emerald-500/15 blur-2xl border border-emerald-400/20" />
            <div className="absolute -bottom-16 -right-16 w-[30rem] h-[30rem] rounded-full bg-teal-500/15 blur-2xl border border-teal-400/20" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[45rem] h-[25rem] bg-emerald-600/10 rounded-full blur-3xl" />
            {/* Subtle Grid Accent */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0596690a_1px,transparent_1px),linear-gradient(to_bottom,#0596690a_1px,transparent_1px)] bg-[size:32px_32px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-transparent to-black/20" />
          </div>
        )}

        {/* Smooth Bottom Fade into Page Body */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none" />

        {/* Hero Foreground Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6 sm:space-y-7">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/25 border border-emerald-300/40 text-emerald-200 text-xs font-bold tracking-wider uppercase backdrop-blur-md shadow-lg shadow-emerald-950/50">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>SISTEM EVALUASI AKADEMIK TERINTEGRASI</span>
          </div>

          {/* Main Title with Crisp Drop Shadow for Maximum Legibility */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12] drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]">
            {portalTitle}
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-emerald-50/95 max-w-2xl mx-auto leading-relaxed font-normal drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)]">
            {portalSubtitle}
          </p>

          {/* Action CTA Button */}
          <div className="pt-2 flex flex-col items-center">
            <Link
              href="/exam/register"
              className="group inline-flex items-center gap-3 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold px-8 py-4 rounded-xl shadow-xl shadow-emerald-950/60 hover:shadow-emerald-500/40 transition-all text-base sm:text-lg transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer border border-emerald-300/40"
            >
              <span>Mulai Masuk & Kerjakan Soal</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
            </Link>
            <p className="text-xs text-emerald-100/90 mt-3.5 flex items-center gap-1.5 font-medium drop-shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>Cukup siapkan NIM Anda yang telah didaftarkan di kelas</span>
            </p>
          </div>

          {/* Trust Highlights Inside Hero (Glassmorphism + Subtle Border) */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 text-xs text-white/95 font-medium">
            <div className="inline-flex items-center gap-1.5 bg-emerald-950/60 backdrop-blur-md border border-white/20 px-3.5 py-1.5 rounded-full shadow-md shadow-black/20">
              <Lock className="w-3.5 h-3.5 text-emerald-300" />
              <span>Sistem Anti-Contek Ketat</span>
            </div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-950/60 backdrop-blur-md border border-white/20 px-3.5 py-1.5 rounded-full shadow-md shadow-black/20">
              <Clock className="w-3.5 h-3.5 text-emerald-300" />
              <span>Auto-Save & Timer Realtime</span>
            </div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-950/60 backdrop-blur-md border border-white/20 px-3.5 py-1.5 rounded-full shadow-md shadow-black/20">
              <FileText className="w-3.5 h-3.5 text-emerald-300" />
              <span>Unduh Lembar Jawaban PDF</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        {/* Floating Announcement / Tata Tertib Card (Overlapping Hero Boundary) */}
        <div className="-mt-10 sm:-mt-14 relative z-20 bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xl shadow-slate-200/60">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-2">
            <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base sm:text-lg">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Info className="w-5 h-5" />
              </div>
              <span>{announcementTitle}</span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Wajib Dibaca Mahasiswa
            </span>
          </div>

          <div className="mt-4 text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-wrap font-sans bg-slate-50/70 p-4 rounded-xl border border-slate-100">
            {announcementBody}
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-16 sm:mt-20">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Keunggulan Platform Ujian Digital
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Pengalaman evaluasi akademik terstandarisasi untuk mendukung kelancaran dan integritas pengerjaan tugas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <FileEdit className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">
                Essay & Lampiran Diagram
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Jawab soal essay secara terstruktur dan lampirkan diagram teknis, sketsa, atau foto tugas yang langsung dicetak ke lembar PDF.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">
                Timer & Auto-Save Realtime
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Jawaban otomatis tersimpan berkala ke sistem. Tidak perlu panik jika perangkat mati tiba-tiba atau koneksi terputus sesaat.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">
                Unduh Salinan PDF Resmi
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Setelah selesai, mahasiswa dan dosen dapat langsung mengunduh lembar jawaban terverifikasi dalam format dokumen PDF resmi.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div className="flex items-center gap-2 font-medium">
            <GraduationCap className="w-4 h-4 text-emerald-700" />
            <span>&copy; 2026 {universityName}. Hak Cipta Dilindungi.</span>
          </div>
          <span className="text-slate-400">
            Sistem Evaluasi & Penugasan Digital Terintegrasi
          </span>
        </div>
      </footer>
    </div>
  );
}
