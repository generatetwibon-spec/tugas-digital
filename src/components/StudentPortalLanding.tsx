"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  Info,
  BarChart3,
  X,
  ShieldCheck,
  Clock,
  FileText,
  Lock,
  Download,
  GraduationCap,
  Sparkles,
  ChevronRight,
  Check,
} from "lucide-react";

interface StudentPortalLandingProps {
  universityName?: string;
  portalTitle?: string;
  portalSubtitle?: string;
  announcementTitle?: string;
  announcementBody?: string;
}

export default function StudentPortalLanding({
  universityName = "Fakultas Tarbiyah dan Ilmu Keguruan (FTIK)",
  portalTitle = "Portal Ujian & Penugasan Digital",
  portalSubtitle = "Platform Evaluasi Akademik Mahasiswa Terintegrasi",
  announcementTitle = "Petunjuk & Tata Tertib Pelaksanaan Ujian",
  announcementBody = "1. Pastikan koneksi internet stabil selama pengerjaan.\n2. Masukkan NIM yang valid untuk memuat identitas dan kelas secara otomatis.\n3. Dilarang melakukan kecurangan (sistem dilengkapi proteksi anti-contek dan anti-inspect).\n4. Jika batas waktu habis, lembar jawaban akan otomatis dikumpulkan ke sistem.",
}: StudentPortalLandingProps) {
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#02231c] text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* ========================================================
          TOP HEADER / BRANDING BAR
      ======================================================== */}
      <header className="relative z-30 w-full border-b border-emerald-900/40 bg-[#02231c]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3.5">
            <div className="relative w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-500/30 p-1 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-950/40">
              <Image
                src="/images/iai-tabah-logo.png"
                alt="Logo IAI TABAH Lamongan"
                width={48}
                height={48}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] sm:text-xs font-black tracking-widest text-emerald-400 uppercase leading-none">
                IAI TABAH LAMONGAN
              </span>
              <span className="text-sm sm:text-base font-extrabold tracking-tight text-white leading-tight mt-0.5">
                {portalTitle.toUpperCase()}
              </span>
              <span className="text-[11px] sm:text-xs font-medium text-emerald-200/80 truncate max-w-xs sm:max-w-md">
                {universityName}
              </span>
            </div>
          </div>

          {/* Right quick nav / portal status */}
          <div className="flex items-center gap-3">
            <div className="hidden md:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-600/40 text-[11px] font-semibold text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Portal Aktif</span>
            </div>

            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-900/50 hover:bg-emerald-800/70 border border-emerald-700/40 text-xs font-semibold text-emerald-200 hover:text-white transition-all"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Dosen & Staf</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ========================================================
          HERO SECTION (DESKTOP PANORAMA & MOBILE ADAPTIVE)
      ======================================================== */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#02231c] via-[#043328] to-[#02231c] py-10 sm:py-16 lg:py-20 flex items-center">
        {/* Background glow & subtle cyber particle effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        
        {/* Bottom-left cyber circuit board graphics */}
        <div className="absolute bottom-0 left-0 w-64 sm:w-80 h-44 sm:h-56 pointer-events-none opacity-40 mix-blend-screen">
          <Image
            src="/images/circuit-decor.png"
            alt="Cyber Circuit Decor"
            width={320}
            height={220}
            className="w-full h-full object-contain object-left-bottom"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
            
            {/* LEFT COLUMN: TITLE, SUBTITLE & INTERACTIVE CTA */}
            <div className="lg:col-span-6 xl:col-span-6 space-y-6 text-left">
              {/* Main Headline */}
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-5xl xl:text-6xl font-black text-white tracking-tight leading-[1.15] drop-shadow-md">
                  Portal Ujian &amp;
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-emerald-200">
                    Penugasan Digital
                  </span>
                </h1>
                <p className="text-sm sm:text-lg text-emerald-100/90 font-medium leading-relaxed max-w-xl">
                  {portalSubtitle}
                </p>
              </div>

              {/* Action Buttons Row */}
              <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
                {/* Primary Button: Pill with Gradient & Gold Highlight */}
                <Link
                  href="/exam/register"
                  className="group relative inline-flex items-center gap-3 px-7 sm:px-8 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-emerald-600 via-emerald-600 to-amber-500 hover:from-emerald-500 hover:via-emerald-500 hover:to-amber-400 text-white font-bold text-sm sm:text-base shadow-xl shadow-emerald-950/60 hover:shadow-emerald-600/30 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>Mulai Masuk &amp; Kerjakan Soal</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                {/* Secondary Button 1: Info (Opens Tata Tertib Modal) */}
                <button
                  type="button"
                  onClick={() => setIsRulesModalOpen(true)}
                  title="Petunjuk &amp; Tata Tertib Pelaksanaan Ujian"
                  className="w-12 h-12 rounded-2xl bg-emerald-900/60 hover:bg-emerald-800/80 border border-emerald-500/40 flex items-center justify-center text-amber-400 hover:text-amber-300 shadow-md shadow-emerald-950/50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <Info className="w-5 h-5" />
                </button>

                {/* Secondary Button 2: Stats (Opens Standar Evaluasi Modal) */}
                <button
                  type="button"
                  onClick={() => setIsStatsModalOpen(true)}
                  title="Sistem &amp; Standar Evaluasi Akademik FTIK"
                  className="w-12 h-12 rounded-2xl bg-emerald-900/60 hover:bg-emerald-800/80 border border-emerald-500/40 flex items-center justify-center text-amber-400 hover:text-amber-300 shadow-md shadow-emerald-950/50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <BarChart3 className="w-5 h-5" />
                </button>
              </div>

              {/* Requirement Note */}
              <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-300 font-medium pt-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Cukup siapkan NIM Anda yang telah didaftarkan di kelas</span>
              </div>
            </div>

            {/* RIGHT COLUMN: HOLOGRAPHIC STUDENT & LAB ARTWORK */}
            <div className="lg:col-span-6 xl:col-span-6 relative flex items-center justify-center lg:justify-end">
              <div className="relative w-full max-w-lg lg:max-w-none">
                {/* Visual Frame */}
                <div className="relative rounded-2xl overflow-hidden border border-emerald-500/30 shadow-2xl shadow-emerald-950/80 bg-emerald-950/40 backdrop-blur-xs">
                  <Image
                    src="/images/student-hero.png"
                    alt="Mahasiswi FTIK IAI TABAH Lamongan"
                    width={700}
                    height={540}
                    className="w-full h-auto object-cover object-center filter brightness-105 contrast-105"
                    priority
                  />
                  {/* Subtle edge overlay blending */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#02231c]/60 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION: PETUNJUK TATA TERTIB & KEUNGGULAN SISTEM
      ======================================================== */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
        {/* Tata Tertib Card */}
        <div className="relative rounded-2xl bg-[#032e25]/90 border border-emerald-600/30 p-6 sm:p-8 shadow-xl shadow-emerald-950/40 backdrop-blur-md">
          <div className="flex items-center justify-between pb-4 border-b border-emerald-800/40 flex-wrap gap-3">
            <div className="flex items-center gap-3 text-white font-bold text-base sm:text-lg">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <Info className="w-5 h-5" />
              </div>
              <span>{announcementTitle}</span>
            </div>
            <span className="text-[11px] font-bold text-emerald-300 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-600/40 uppercase tracking-wider">
              {universityName}
            </span>
          </div>

          <div className="mt-4 text-xs sm:text-sm text-emerald-100/90 leading-relaxed whitespace-pre-wrap font-sans bg-black/20 p-4 sm:p-5 rounded-xl border border-emerald-800/30">
            {announcementBody}
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-1.5">
            <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
              Keunggulan Platform Ujian Digital FTIK
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200/80">
              Pengalaman evaluasi akademik terstandarisasi untuk integritas, ketelitian, dan kenyamanan mahasiswa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="rounded-2xl bg-[#032e25]/80 border border-emerald-600/25 p-6 hover:border-emerald-500/50 hover:-translate-y-1 transition-all duration-200 space-y-3 shadow-lg shadow-emerald-950/30">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">
                Uraian Essay &amp; Lampiran Digital
              </h3>
              <p className="text-xs text-emerald-200/80 leading-relaxed">
                Tuliskan analisis dan uraian essay secara terstruktur. Lengkapi jawaban dengan unggahan diagram teknis, sketsa kurikulum, atau foto lembar kerja yang otomatis tercetak rapi ke berkas PDF.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl bg-[#032e25]/80 border border-emerald-600/25 p-6 hover:border-emerald-500/50 hover:-translate-y-1 transition-all duration-200 space-y-3 shadow-lg shadow-emerald-950/30">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">
                Timer Realtime &amp; Auto-Save Cloud
              </h3>
              <p className="text-xs text-emerald-200/80 leading-relaxed">
                Seluruh ketikan jawaban tersimpan otomatis secara berkala ke cloud. Tidak perlu khawatir apabila koneksi terputus sesaat atau terjadi gangguan perangkat, pengerjaan dapat langsung dilanjutkan.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl bg-[#032e25]/80 border border-emerald-600/25 p-6 hover:border-emerald-500/50 hover:-translate-y-1 transition-all duration-200 space-y-3 shadow-lg shadow-emerald-950/30">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">
                Unduh Salinan Lembar Jawaban PDF Resmi
              </h3>
              <p className="text-xs text-emerald-200/80 leading-relaxed">
                Begitu ujian selesai dikumpulkan, mahasiswa dan dosen pengampu dapat langsung mengunduh salinan lembar jawaban berformat PDF resmi terverifikasi lengkap dengan waktu submit dan nama mahasiswa.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* ========================================================
          FOOTER
      ======================================================== */}
      <footer className="w-full border-t border-emerald-900/50 bg-[#011813] py-8 text-center text-xs text-emerald-300/70">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span className="font-bold text-emerald-200">IAI TABAH Lamongan</span>
            <span>&bull;</span>
            <span>{universityName}</span>
          </div>
          <p className="text-[11px] text-emerald-400/60">
            &copy; 2026 {universityName} - Institut Agama Islam Tarbiyatut Tholabah (IAI TABAH) Lamongan. Hak Cipta Dilindungi.
          </p>
        </div>
      </footer>

      {/* ========================================================
          MODAL: PETUNJUK TATA TERTIB UJIAN (INFO ICON)
      ======================================================== */}
      {isRulesModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#032e25] border border-emerald-500/40 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-800/40">
              <div className="flex items-center gap-2.5 text-white font-bold text-base">
                <Info className="w-5 h-5 text-amber-400" />
                <span>Petunjuk &amp; Tata Tertib Ujian FTIK</span>
              </div>
              <button
                type="button"
                onClick={() => setIsRulesModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              <div className="p-3.5 rounded-xl bg-black/25 border border-emerald-800/30 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-amber-400">1.</span>
                  <span><strong>Nomor Induk Mahasiswa (NIM):</strong> Pastikan Anda menggunakan NIM aktif yang telah terdaftar dalam sistem kelas oleh dosen pengampu.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-amber-400">2.</span>
                  <span><strong>Integritas Akademik &amp; Anti-Contek:</strong> Sistem secara otomatis memantau perpindahan tab, blokir tombol inspect/developer tools, dan menonaktifkan fitur copy-paste.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-amber-400">3.</span>
                  <span><strong>Auto-Save:</strong> Setiap jawaban essay tersimpan otomatis secara berkala ke database cloud.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-amber-400">4.</span>
                  <span><strong>Batas Waktu:</strong> Jika waktu pengerjaan berakhir, jawaban Anda akan langsung dikumpulkan otomatis ke dosen.</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Link
                href="/exam/register"
                onClick={() => setIsRulesModalOpen(false)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md cursor-pointer transition-colors"
              >
                <span>Saya Mengerti &amp; Masuk Ujian</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: STANDAR SISTEM EVALUASI AKADEMIK (STATS ICON)
      ======================================================== */}
      {isStatsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#032e25] border border-emerald-500/40 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-800/40">
              <div className="flex items-center gap-2.5 text-white font-bold text-base">
                <BarChart3 className="w-5 h-5 text-amber-400" />
                <span>Standar Evaluasi Akademik FTIK</span>
              </div>
              <button
                type="button"
                onClick={() => setIsStatsModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              <p className="text-xs text-emerald-300">
                Sistem Penugasan &amp; Ujian Digital FTIK IAI TABAH Lamongan dirancang berbasis standar capaian pembelajaran:
              </p>

              <div className="grid grid-cols-1 gap-2.5">
                <div className="p-3 rounded-xl bg-black/25 border border-emerald-800/30 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 text-xs font-bold">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">Penilaian Terbobot &amp; Transparan</h4>
                    <p className="text-[11px] text-emerald-200/80 mt-0.5">Setiap butir soal memiliki bobot poin jelas yang dinilai langsung oleh dosen pengampu.</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/25 border border-emerald-800/30 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 text-xs font-bold">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">Verifikasi Kehadiran Terpadu</h4>
                    <p className="text-[11px] text-emerald-200/80 mt-0.5">Mahasiswa wajib memenuhi syarat presensi kuliah untuk dapat membuka lembar penugasan.</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/25 border border-emerald-800/30 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 text-xs font-bold">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">Arsip Digital &amp; PDF Bertanda Tangan</h4>
                    <p className="text-[11px] text-emerald-200/80 mt-0.5">Setiap pengumpulan menghasilkan dokumen PDF berstempel resmi yang dapat diunduh mahasiswa.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsStatsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-emerald-950 border border-emerald-700/50 hover:bg-emerald-900 text-white font-bold text-xs cursor-pointer transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
