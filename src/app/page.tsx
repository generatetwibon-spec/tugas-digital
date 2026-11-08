import Link from "next/link";
import {
  GraduationCap,
  ShieldCheck,
  Clock,
  FileEdit,
  ArrowRight,
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
      {/* Top Navbar: Clean & Formal Academic Header */}
      <header className="border-b border-slate-200/80 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-800 flex items-center justify-center text-white shadow-xs font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm sm:text-base tracking-tight text-slate-900 block leading-tight">
                {portalTitle}
              </span>
              <span className="text-[11px] sm:text-xs text-slate-500 font-medium truncate block max-w-xs sm:max-w-md">
                {universityName}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section: Dignified Academic Green, Clear Background Image, No Clutter */}
      <section className="relative w-full overflow-hidden bg-slate-900 py-16 sm:py-24 lg:py-28 flex items-center justify-center">
        {/* Background Image & Formal Overlay */}
        {bannerImageUrl ? (
          <>
            <img
              src={bannerImageUrl}
              alt="Banner Akademik Kampus"
              className="absolute inset-0 w-full h-full object-cover object-center filter brightness-95 contrast-105"
            />
            {/* Elegant Deep Academic Tint (Not pitch black, not neon green) */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/60 to-slate-900/40" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(6,78,59,0.3)_0%,_transparent_70%)]" />
          </>
        ) : (
          /* Fallback Clean Slate & Deep Forest Backdrop */
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(4,120,87,0.15)_0%,_transparent_75%)]" />
          </div>
        )}

        {/* Smooth Transition into Content Below */}
        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none" />

        {/* Hero Foreground Content */}
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-5 sm:space-y-6">
          {/* Main Title: Sharp, Authoritative & Legible */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight sm:leading-snug drop-shadow-sm">
            {portalTitle}
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-base text-slate-200/90 max-w-xl mx-auto leading-relaxed font-normal">
            {portalSubtitle}
          </p>

          {/* Action CTA Button: Prestigious Deep Emerald (#065F46 / Emerald-800) */}
          <div className="pt-2 flex flex-col items-center">
            <Link
              href="/exam/register"
              className="group inline-flex items-center gap-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-semibold px-7 py-3.5 rounded-xl shadow-lg shadow-black/25 hover:shadow-emerald-950/40 transition-all text-sm sm:text-base hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <span>Mulai Masuk & Kerjakan Soal</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="text-xs text-slate-300 mt-3 flex items-center justify-center gap-1.5 font-normal">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Cukup siapkan NIM Anda yang telah didaftarkan di kelas</span>
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 pb-16">
        {/* Floating Announcement / Tata Tertib Card (Overlapping Hero) */}
        <div className="-mt-8 sm:-mt-10 relative z-20 bg-white rounded-xl border border-slate-200 p-5 sm:p-7 shadow-lg shadow-slate-200/50">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 flex-wrap gap-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm sm:text-base">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
                <Info className="w-4 h-4" />
              </div>
              <span>{announcementTitle}</span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Tata Tertib Ujian
            </span>
          </div>

          <div className="mt-3.5 text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-wrap font-sans bg-slate-50/70 p-4 rounded-lg border border-slate-100">
            {announcementBody}
          </div>
        </div>

        {/* Feature Cards Grid: Dignified & Practical */}
        <div className="mt-12 sm:mt-14">
          <div className="text-center max-w-xl mx-auto mb-8 space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Standar Evaluasi Akademik Digital
            </h2>
            <p className="text-xs text-slate-500">
              Mendukung kelancaran pelaksanaan tugas dan evaluasi belajar mahasiswa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-200 flex flex-col gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                <FileEdit className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">
                Essay & Lampiran Diagram
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Jawab soal essay secara terstruktur dan lampirkan diagram teknis atau sketsa yang langsung dicetak ke lembar PDF.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-200 flex flex-col gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">
                Timer & Auto-Save Realtime
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Jawaban otomatis tersimpan berkala ke sistem. Aman jika perangkat mati tiba-tiba atau koneksi terputus sesaat.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-200 flex flex-col gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">
                Unduh Salinan PDF Resmi
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Setelah selesai, mahasiswa dan dosen dapat langsung mengunduh arsip lembar jawaban resmi dalam format PDF.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-emerald-800" />
            <span>&copy; 2026 {universityName}. Hak Cipta Dilindungi.</span>
          </div>
          <span className="text-slate-400">
            Sistem Evaluasi Akademik Terintegrasi
          </span>
        </div>
      </footer>
    </div>
  );
}
