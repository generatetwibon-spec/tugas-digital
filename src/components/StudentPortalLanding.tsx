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
  FileCheck2,
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
  portalSubtitle = "Platform evaluasi akademik mahasiswa terintegrasi untuk mendukung ketertiban, kejujuran, dan kelancaran ujian digital.",
  announcementTitle = "Petunjuk & Tata Tertib Pelaksanaan Ujian",
  announcementBody = "1. Pastikan koneksi internet stabil selama pengerjaan.\n2. Masukkan NIM yang valid untuk memuat identitas dan kelas secara otomatis.\n3. Dilarang melakukan kecurangan (sistem dilengkapi proteksi anti-contek dan anti-inspect).\n4. Jika batas waktu habis, lembar jawaban akan otomatis dikumpulkan ke sistem.",
}: StudentPortalLandingProps) {
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between font-sans selection:bg-emerald-800 selection:text-white">
      {/* ========================================================
          1. HEADER / NAVBAR (Clean White, Deep Emerald Accent)
      ======================================================== */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0 shadow-xs">
              <Image
                src="/images/iai-tabah-logo.png"
                alt="Logo IAI TABAH Lamongan"
                width={40}
                height={40}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] sm:text-[11px] font-bold tracking-widest text-emerald-800 uppercase leading-none">
                IAI TABAH LAMONGAN
              </span>
              <span className="text-sm sm:text-base font-bold tracking-tight text-slate-900 leading-tight mt-0.5 font-serif">
                {portalTitle}
              </span>
              <span className="text-[11px] sm:text-xs font-medium text-slate-500 truncate max-w-xs sm:max-w-md">
                {universityName}
              </span>
            </div>
          </div>

          {/* Academic Year Info (Calm & Formal) */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-700" />
            <span>Tahun Akademik 2026/2027</span>
          </div>
        </div>
      </header>

      {/* ========================================================
          2. HERO SECTION (Calm, 3-Color Academic Aesthetic)
      ======================================================== */}
      <section className="w-full py-10 sm:py-16 lg:py-20 border-b border-slate-200/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* LEFT COLUMN: TITLE, SUBTITLE & CLEAN CTAS */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Institution Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-700" />
                <span>{universityName}</span>
              </div>

              {/* Main Headline (Font 1: Elegant Serif) */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-slate-900 tracking-tight leading-[1.12]">
                Portal Ujian &amp;
                <br />
                <span className="text-emerald-800">Penugasan Digital</span>
              </h1>

              {/* Subtitle (Font 2: Crisp Sans) */}
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl font-normal">
                {portalSubtitle}
              </p>

              {/* Action Buttons Row */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                {/* Primary Button */}
                <Link
                  href="/exam/register"
                  className="group inline-flex items-center gap-2.5 px-6 sm:px-7 py-3.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-sm sm:text-base shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>Mulai Masuk &amp; Kerjakan Soal</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                {/* Secondary Button: Tata Tertib */}
                <button
                  type="button"
                  onClick={() => setIsRulesModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 hover:border-slate-400 font-semibold text-sm shadow-xs transition-colors cursor-pointer"
                >
                  <Info className="w-4 h-4 text-emerald-800" />
                  <span>Tata Tertib</span>
                </button>

                {/* Secondary Button: Panduan Evaluasi */}
                <button
                  type="button"
                  onClick={() => setIsStatsModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 hover:border-slate-400 font-semibold text-sm shadow-xs transition-colors cursor-pointer"
                >
                  <BarChart3 className="w-4 h-4 text-emerald-800" />
                  <span>Panduan Nilai</span>
                </button>
              </div>

              {/* Requirement Note */}
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-normal pt-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Cukup siapkan NIM Anda yang telah didaftarkan di kelas</span>
              </div>
            </div>

            {/* RIGHT COLUMN: REFINED HERO ARTWORK (NO NEON GLOW) */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <div className="w-full max-w-md lg:max-w-none bg-white rounded-2xl p-2.5 border border-slate-200 shadow-md shadow-slate-200/50">
                <div className="rounded-xl overflow-hidden bg-slate-900 relative">
                  <Image
                    src="/images/student-hero.png"
                    alt="Mahasiswi FTIK IAI TABAH Lamongan"
                    width={560}
                    height={430}
                    className="w-full h-auto object-cover object-center"
                    priority
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================
          3. MAIN CONTENT: TATA TERTIB & FITUR UNGGULAN
      ======================================================== */}
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
        {/* Tata Tertib Card */}
        <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 flex items-center justify-center">
                <Info className="w-5 h-5" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 font-serif">
                {announcementTitle}
              </h2>
            </div>
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {universityName}
            </span>
          </div>

          <div className="mt-4 text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-wrap font-sans bg-slate-50/80 p-4 sm:p-5 rounded-xl border border-slate-200/80">
            {announcementBody}
          </div>
        </div>

        {/* 3 Feature Cards Grid */}
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif tracking-tight">
              Standar Evaluasi Akademik Digital
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Mendukung ketertiban, integritas, dan transparansi pelaksanaan ujian bagi seluruh mahasiswa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Feature 1 */}
            <div className="rounded-2xl bg-white border border-slate-200 p-6 hover:border-slate-300 hover:shadow-sm transition-all duration-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base font-serif">
                Uraian Essay &amp; Lampiran Digital
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tuliskan analisis jawaban secara terstruktur. Lengkapi pengerjaan dengan unggahan diagram teknis atau foto lembar kerja yang otomatis tercetak rapi ke berkas PDF.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl bg-white border border-slate-200 p-6 hover:border-slate-300 hover:shadow-sm transition-all duration-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base font-serif">
                Timer Realtime &amp; Auto-Save Cloud
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Seluruh ketikan jawaban tersimpan otomatis secara berkala ke server. Jika terjadi kendala koneksi atau perangkat mati sesaat, pengerjaan dapat langsung dilanjutkan tanpa hilang.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl bg-white border border-slate-200 p-6 hover:border-slate-300 hover:shadow-sm transition-all duration-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base font-serif">
                Unduh Lembar Jawaban PDF Resmi
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Setelah pengerjaan dikumpulkan, mahasiswa dapat langsung mengunduh salinan berkas PDF resmi terverifikasi lengkap dengan identitas mahasiswa dan rincian jawaban.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* ========================================================
          4. FOOTER (Clean Slate, Dignified Academic Tone)
      ======================================================== */}
      <footer className="w-full border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 space-y-2">
          <div className="flex items-center justify-center gap-2 font-medium">
            <span className="font-bold text-slate-900">IAI TABAH Lamongan</span>
            <span>&bull;</span>
            <span className="text-emerald-800">{universityName}</span>
          </div>
          <p className="text-[11px] text-slate-400">
            &copy; 2026 {universityName} - Institut Agama Islam Tarbiyatut Tholabah (IAI TABAH) Lamongan. Hak Cipta Dilindungi.
          </p>
        </div>
      </footer>

      {/* ========================================================
          MODAL: PETUNJUK TATA TERTIB UJIAN
      ======================================================== */}
      {isRulesModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base font-serif">
                <Info className="w-5 h-5 text-emerald-800" />
                <span>Petunjuk &amp; Tata Tertib Ujian</span>
              </div>
              <button
                type="button"
                onClick={() => setIsRulesModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-emerald-800">1.</span>
                  <span><strong>Nomor Induk Mahasiswa (NIM):</strong> Gunakan NIM aktif yang telah terdaftar dalam sistem kelas oleh dosen pengampu.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-emerald-800">2.</span>
                  <span><strong>Integritas Akademik:</strong> Sistem dilengkapi pengaman anti-inspect element dan pengingat ketertiban pengerjaan.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-emerald-800">3.</span>
                  <span><strong>Penyimpanan Otomatis:</strong> Jawaban essay Anda tersimpan secara realtime berkala ke cloud.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-emerald-800">4.</span>
                  <span><strong>Batas Waktu:</strong> Apabila durasi waktu ujian habis, lembar jawaban akan langsung dikumpulkan otomatis.</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsRulesModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium text-xs hover:bg-slate-50 cursor-pointer"
              >
                Tutup
              </button>
              <Link
                href="/exam/register"
                onClick={() => setIsRulesModalOpen(false)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs cursor-pointer transition-colors"
              >
                <span>Saya Mengerti &amp; Masuk Ujian</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: STANDAR SISTEM EVALUASI AKADEMIK
      ======================================================== */}
      {isStatsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base font-serif">
                <BarChart3 className="w-5 h-5 text-emerald-800" />
                <span>Standar Evaluasi Akademik FTIK</span>
              </div>
              <button
                type="button"
                onClick={() => setIsStatsModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <p className="text-xs text-slate-500">
                Sistem Penugasan &amp; Ujian Digital FTIK IAI TABAH Lamongan dirancang berbasis standar capaian pembelajaran:
              </p>

              <div className="grid grid-cols-1 gap-2.5">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 text-xs font-bold">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Penilaian Terbobot &amp; Transparan</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Setiap butir soal memiliki bobot poin jelas yang dinilai langsung oleh dosen pengampu.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 text-xs font-bold">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Verifikasi Kehadiran Terpadu</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Mahasiswa wajib memenuhi syarat presensi kuliah untuk dapat membuka lembar ujian.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 text-xs font-bold">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Arsip Lembar Jawaban PDF Resmi</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Setiap pengumpulan menghasilkan berkas dokumen PDF resmi yang dapat diunduh langsung.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsStatsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs cursor-pointer transition-colors"
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
