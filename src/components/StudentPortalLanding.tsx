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
} from "lucide-react";

export interface StudentPortalLandingProps {
  institutionName?: string;
  facultyName?: string;
  portalTitle?: string;
  portalSubtitle?: string;
  heroHeadline?: string;
  ctaButtonText?: string;
  ctaHelperText?: string;
  academicYear?: string;
  logoUrl?: string | null;
  heroImageUrl?: string | null;
  announcementTitle?: string;
  announcementBody?: string;
  feature1Title?: string;
  feature1Desc?: string;
  feature2Title?: string;
  feature2Desc?: string;
  feature3Title?: string;
  feature3Desc?: string;
  footerText?: string;
}

export default function StudentPortalLanding({
  institutionName = "IAI TABAH LAMONGAN",
  facultyName = "Fakultas Tarbiyah dan Ilmu Keguruan (FTIK)",
  portalTitle = "Portal Ujian & Penugasan Digital",
  portalSubtitle = "Platform Evaluasi Akademik Mahasiswa Terintegrasi",
  heroHeadline = "Portal Ujian & Penugasan Digital",
  ctaButtonText = "Mulai Masuk & Kerjakan Soal",
  ctaHelperText = "Cukup siapkan NIM Anda yang telah didaftarkan di kelas",
  academicYear = "Tahun Akademik 2026/2027",
  logoUrl,
  heroImageUrl,
  announcementTitle = "Petunjuk & Tata Tertib Pelaksanaan Ujian",
  announcementBody = "1. Pastikan koneksi internet stabil selama pengerjaan.\n2. Masukkan NIM yang valid untuk memuat identitas dan kelas secara otomatis.\n3. Dilarang melakukan kecurangan (sistem dilengkapi proteksi anti-contek dan anti-inspect).\n4. Jika batas waktu habis, lembar jawaban akan otomatis dikumpulkan ke sistem.",
  feature1Title = "Uraian Essay & Lampiran Digital",
  feature1Desc = "Tuliskan analisis dan uraian essay secara terstruktur. Lengkapi jawaban dengan unggahan diagram teknis, sketsa kurikulum, atau foto lembar kerja yang otomatis tercetak rapi ke berkas PDF.",
  feature2Title = "Timer Realtime & Auto-Save Cloud",
  feature2Desc = "Seluruh ketikan jawaban tersimpan otomatis secara berkala ke cloud. Tidak perlu khawatir apabila koneksi terputus sesaat atau terjadi gangguan perangkat, pengerjaan dapat langsung dilanjutkan.",
  feature3Title = "Unduh Lembar Jawaban PDF Resmi",
  feature3Desc = "Begitu ujian selesai dikumpulkan, mahasiswa dan dosen pengampu dapat langsung mengunduh salinan lembar jawaban berformat PDF resmi terverifikasi lengkap dengan waktu submit dan nama mahasiswa.",
  footerText = "Hak Cipta Dilindungi.",
}: StudentPortalLandingProps) {
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

  // Logo source (fallback to default local image)
  const activeLogo = logoUrl && logoUrl.trim() ? logoUrl : "/images/iai-tabah-logo.png";
  // Hero illustration source (fallback to default local image)
  const activeHeroImage = heroImageUrl && heroImageUrl.trim() ? heroImageUrl : "/images/student-hero.png";

  return (
    <div className="min-h-screen bg-[#02231c] text-slate-100 flex flex-col justify-between selection:bg-emerald-600 selection:text-white font-sans">
      {/* ========================================================
          1. HEADER / BRANDING BAR (100% Dynamic)
      ======================================================== */}
      <header className="relative z-30 w-full border-b border-emerald-900/40 bg-[#02231c]/95 backdrop-blur-md">
        <div className="w-full max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 h-20 flex items-center justify-between">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3.5">
            <div className="relative w-11 h-11 rounded-xl bg-emerald-950/80 border border-emerald-500/30 p-1 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-950/40">
              <Image
                src={activeLogo}
                alt={`Logo ${institutionName}`}
                width={40}
                height={40}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] sm:text-[11px] font-black tracking-widest text-emerald-400 uppercase leading-none">
                {institutionName}
              </span>
              <span className="text-sm sm:text-base font-extrabold tracking-tight text-white leading-tight mt-0.5">
                {portalTitle.toUpperCase()}
              </span>
              <span className="text-[11px] sm:text-xs font-medium text-emerald-200/80 truncate max-w-xs sm:max-w-md">
                {facultyName}
              </span>
            </div>
          </div>

          {/* Academic Info */}
          {academicYear && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-emerald-300/80 font-medium bg-emerald-950/60 px-3.5 py-1.5 rounded-full border border-emerald-700/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{academicYear}</span>
            </div>
          )}
        </div>
      </header>

      {/* ========================================================
          2. HERO SECTION (100% Dynamic Text & Graphics)
      ======================================================== */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#02231c] via-[#043328] to-[#02231c] py-8 sm:py-12 lg:py-16 flex items-center">
        {/* Soft Ambient Glows */}
        <div className="absolute top-1/4 left-1/6 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/6 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Bottom-Left Cyber Circuit Decor */}
        <div className="absolute bottom-0 left-0 w-60 sm:w-72 h-36 sm:h-44 pointer-events-none opacity-25 mix-blend-screen">
          <Image
            src="/images/circuit-decor.png"
            alt="Cyber Circuit Decor"
            width={320}
            height={141}
            className="w-full h-full object-contain object-left-bottom"
          />
        </div>

        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* LEFT COLUMN: TITLE & CTAS */}
            <div className="lg:col-span-6 xl:col-span-6 space-y-6 text-left">
              {/* Main Headline */}
              <div className="space-y-2.5">
                <h1 className="text-3xl sm:text-4xl lg:text-[50px] xl:text-[54px] font-black text-white tracking-tight leading-[1.14] drop-shadow-md">
                  {heroHeadline}
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-emerald-100/90 font-medium leading-relaxed max-w-lg">
                  {portalSubtitle}
                </p>
              </div>

              {/* Action Buttons Row */}
              <div className="pt-1 flex flex-wrap items-center gap-3">
                {/* Primary Button */}
                <Link
                  href="/exam/register"
                  className="group relative inline-flex items-center gap-3 px-6 sm:px-7 py-3 sm:py-3.5 rounded-full bg-gradient-to-r from-emerald-600 via-emerald-600 to-amber-500 hover:from-emerald-500 hover:via-emerald-500 hover:to-amber-400 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-950/60 hover:shadow-emerald-600/30 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>{ctaButtonText}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                {/* Secondary Button 1: Info */}
                <button
                  type="button"
                  onClick={() => setIsRulesModalOpen(true)}
                  title="Petunjuk &amp; Tata Tertib Pelaksanaan Ujian"
                  className="w-11 h-11 rounded-xl bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-600/30 flex items-center justify-center text-amber-400 hover:text-amber-300 shadow-sm transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  <Info className="w-4 h-4" />
                </button>

                {/* Secondary Button 2: Stats */}
                <button
                  type="button"
                  onClick={() => setIsStatsModalOpen(true)}
                  title="Sistem &amp; Standar Evaluasi Akademik"
                  className="w-11 h-11 rounded-xl bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-600/30 flex items-center justify-center text-amber-400 hover:text-amber-300 shadow-sm transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
              </div>

              {/* Requirement Note */}
              {ctaHelperText && (
                <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-300/90 font-medium pt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{ctaHelperText}</span>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: DYNAMIC HERO ARTWORK */}
            <div className="lg:col-span-6 xl:col-span-6 flex items-center justify-center lg:justify-end">
              <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl">
                <div className="relative rounded-2xl overflow-hidden border border-emerald-500/25 shadow-2xl shadow-emerald-950/80 bg-emerald-950/40">
                  <Image
                    src={activeHeroImage}
                    alt={`Ilustrasi ${portalTitle}`}
                    width={560}
                    height={541}
                    className="w-full h-auto object-cover object-center filter brightness-105 contrast-105"
                    priority
                  />
                  {/* Gentle bottom shade */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#02231c]/50 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================
          3. SECTION: PETUNJUK TATA TERTIB & KEUNGGULAN SISTEM
      ======================================================== */}
      <main className="w-full max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 py-12 sm:py-16 space-y-12">
        {/* Tata Tertib Card */}
        {announcementBody && (
          <div className="relative rounded-2xl bg-[#032e25]/90 border border-emerald-600/30 p-6 sm:p-8 shadow-xl shadow-emerald-950/40 backdrop-blur-md">
            <div className="flex items-center justify-between pb-4 border-b border-emerald-800/40 flex-wrap gap-3">
              <div className="flex items-center gap-3 text-white font-bold text-base sm:text-lg">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <Info className="w-5 h-5" />
                </div>
                <span>{announcementTitle}</span>
              </div>
              <span className="text-[11px] font-bold text-emerald-300 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-600/40 uppercase tracking-wider">
                {facultyName}
              </span>
            </div>

            <div className="mt-4 text-xs sm:text-sm text-emerald-100/90 leading-relaxed whitespace-pre-wrap font-sans bg-black/20 p-4 sm:p-5 rounded-xl border border-emerald-800/30">
              {announcementBody}
            </div>
          </div>
        )}

        {/* 3 Feature Cards Grid */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Keunggulan Platform Ujian Digital
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200/80">
              Pengalaman evaluasi akademik terstandarisasi untuk integritas, ketelitian, dan kenyamanan seluruh mahasiswa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="rounded-2xl bg-[#032e25]/80 border border-emerald-600/25 p-6 hover:border-emerald-500/50 hover:-translate-y-1 transition-all duration-200 space-y-3 shadow-lg shadow-emerald-950/30">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">
                {feature1Title}
              </h3>
              <p className="text-xs text-emerald-200/80 leading-relaxed">
                {feature1Desc}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl bg-[#032e25]/80 border border-emerald-600/25 p-6 hover:border-emerald-500/50 hover:-translate-y-1 transition-all duration-200 space-y-3 shadow-lg shadow-emerald-950/30">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">
                {feature2Title}
              </h3>
              <p className="text-xs text-emerald-200/80 leading-relaxed">
                {feature2Desc}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl bg-[#032e25]/80 border border-emerald-600/25 p-6 hover:border-emerald-500/50 hover:-translate-y-1 transition-all duration-200 space-y-3 shadow-lg shadow-emerald-950/30">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">
                {feature3Title}
              </h3>
              <p className="text-xs text-emerald-200/80 leading-relaxed">
                {feature3Desc}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* ========================================================
          4. FOOTER
      ======================================================== */}
      <footer className="w-full border-t border-emerald-900/50 bg-[#011813] py-8 text-center text-xs text-emerald-300/70">
        <div className="max-w-[1400px] mx-auto px-4 space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span className="font-bold text-emerald-200">{institutionName}</span>
            <span>&bull;</span>
            <span>{facultyName}</span>
          </div>
          <p className="text-[11px] text-emerald-400/60">
            &copy; 2026 {facultyName} - {institutionName}. {footerText}
          </p>
        </div>
      </footer>

      {/* ========================================================
          MODAL: PETUNJUK TATA TERTIB UJIAN
      ======================================================== */}
      {isRulesModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#032e25] border border-emerald-500/40 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-800/40">
              <div className="flex items-center gap-2.5 text-white font-bold text-base">
                <Info className="w-5 h-5 text-amber-400" />
                <span>{announcementTitle}</span>
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
              <div className="p-4 rounded-xl bg-black/25 border border-emerald-800/30 whitespace-pre-wrap">
                {announcementBody}
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
          MODAL: STANDAR SISTEM EVALUASI AKADEMIK
      ======================================================== */}
      {isStatsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#032e25] border border-emerald-500/40 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-800/40">
              <div className="flex items-center gap-2.5 text-white font-bold text-base">
                <BarChart3 className="w-5 h-5 text-amber-400" />
                <span>Standar Evaluasi Akademik</span>
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
                Sistem Penugasan &amp; Ujian Digital {institutionName} dirancang berbasis standar capaian pembelajaran:
              </p>

              <div className="grid grid-cols-1 gap-2.5">
                <div className="p-3 rounded-xl bg-black/25 border border-emerald-800/30 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 text-xs font-bold">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">{feature1Title}</h4>
                    <p className="text-[11px] text-emerald-200/80 mt-0.5">{feature1Desc}</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/25 border border-emerald-800/30 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 text-xs font-bold">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">{feature2Title}</h4>
                    <p className="text-[11px] text-emerald-200/80 mt-0.5">{feature2Desc}</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/25 border border-emerald-800/30 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 text-xs font-bold">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">{feature3Title}</h4>
                    <p className="text-[11px] text-emerald-200/80 mt-0.5">{feature3Desc}</p>
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
