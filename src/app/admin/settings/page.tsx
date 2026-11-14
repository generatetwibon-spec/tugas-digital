"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Lock,
  ShieldCheck,
  Server,
  Database,
  CheckCircle2,
  Loader2,
  KeyRound,
  LayoutTemplate,
  Save,
  Image as ImageIcon,
  Upload,
  Building,
  GraduationCap,
  Sparkles,
  FileText,
  Clock,
  Layers,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  // Password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // Landing Setting states (100% Dynamic SaaS White-Label)
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [institutionName, setInstitutionName] = useState("");
  const [facultyName, setFacultyName] = useState("");
  const [portalTitle, setPortalTitle] = useState("");
  const [portalSubtitle, setPortalSubtitle] = useState("");
  const [heroHeadline, setHeroHeadline] = useState("");
  const [ctaButtonText, setCtaButtonText] = useState("");
  const [ctaHelperText, setCtaHelperText] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementBody, setAnnouncementBody] = useState("");
  const [feature1Title, setFeature1Title] = useState("");
  const [feature1Desc, setFeature1Desc] = useState("");
  const [feature2Title, setFeature2Title] = useState("");
  const [feature2Desc, setFeature2Desc] = useState("");
  const [feature3Title, setFeature3Title] = useState("");
  const [feature3Desc, setFeature3Desc] = useState("");
  const [footerText, setFooterText] = useState("");

  const [savingLanding, setSavingLanding] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);

  // File Upload Helper to Supabase Storage
  const handleUploadFile = async (
    file: File,
    folder: string,
    setUrl: (url: string) => void,
    setUploading: (loading: boolean) => void,
    label: string
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    try {
      setUploading(true);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengunggah gambar");

      setUrl(data.url);
      toast.success(`${label} berhasil diunggah ke Supabase Storage!`);
    } catch (err: any) {
      toast.error(err.message || "Gagal mengunggah file");
    } finally {
      setUploading(false);
    }
  };

  // Load landing settings
  useEffect(() => {
    async function loadLanding() {
      try {
        setLoadingSettings(true);
        const res = await fetch("/api/settings/landing");
        if (res.ok) {
          const data = await res.json();
          if (data.setting) {
            const s = data.setting;
            setInstitutionName(s.institutionName || "IAI TABAH LAMONGAN");
            setFacultyName(s.facultyName || s.universityName || "Fakultas Tarbiyah dan Ilmu Keguruan (FTIK)");
            setPortalTitle(s.portalTitle || "Portal Ujian & Penugasan Digital");
            setPortalSubtitle(s.portalSubtitle || "Platform Evaluasi Akademik Mahasiswa Terintegrasi");
            setHeroHeadline(s.heroHeadline || s.portalTitle || "Portal Ujian & Penugasan Digital");
            setCtaButtonText(s.ctaButtonText || "Mulai Masuk & Kerjakan Soal");
            setCtaHelperText(s.ctaHelperText || "Cukup siapkan NIM Anda yang telah didaftarkan di kelas");
            setAcademicYear(s.academicYear || "Tahun Akademik 2026/2027");
            setLogoUrl(s.logoUrl || "");
            setHeroImageUrl(s.heroImageUrl || "");
            setAnnouncementTitle(s.announcementTitle || "Petunjuk & Tata Tertib Pelaksanaan Ujian");
            setAnnouncementBody(s.announcementBody || "");
            setFeature1Title(s.feature1Title || "Uraian Essay & Lampiran Digital");
            setFeature1Desc(s.feature1Desc || "");
            setFeature2Title(s.feature2Title || "Timer Realtime & Auto-Save Cloud");
            setFeature2Desc(s.feature2Desc || "");
            setFeature3Title(s.feature3Title || "Unduh Lembar Jawaban PDF Resmi");
            setFeature3Desc(s.feature3Desc || "");
            setFooterText(s.footerText || "Hak Cipta Dilindungi.");
          }
        }
      } catch {
        // silent
      } finally {
        setLoadingSettings(false);
      }
    }
    loadLanding();
  }, []);

  // Save Landing Settings
  const handleSaveLanding = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingLanding(true);
      const res = await fetch("/api/settings/landing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          institutionName,
          facultyName,
          universityName: facultyName,
          portalTitle,
          portalSubtitle,
          heroHeadline,
          ctaButtonText,
          ctaHelperText,
          academicYear,
          logoUrl: logoUrl.trim() || null,
          heroImageUrl: heroImageUrl.trim() || null,
          announcementTitle,
          announcementBody,
          feature1Title,
          feature1Desc,
          feature2Title,
          feature2Desc,
          feature3Title,
          feature3Desc,
          footerText,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan pengaturan");

      toast.success("Tampilan dashboard mahasiswa berhasil diperbarui secara dinamis!");
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan");
    } finally {
      setSavingLanding(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error("Password lama wajib diisi");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password baru minimal 6 karakter");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi password baru tidak cocok");
      return;
    }

    try {
      setSavingPassword(true);
      const res = await fetch("/api/admin/settings/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Gagal memperbarui password");
        return;
      }

      toast.success("Password admin berhasil diperbarui");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Terjadi masalah jaringan");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Pengaturan & Kustomisasi Portal (SaaS Ready)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Ubah logo, ilustrasi hero, nama instansi/kampus, judul, dan seluruh teks di dashboard mahasiswa secara dinamis
        </p>
      </div>

      {/* SECTION 1: CUSTOM CMS PORTAL MAHASISWA */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <LayoutTemplate className="w-5 h-5 text-emerald-700" />
            <span>Kustomisasi Tampilan Halaman Depan Mahasiswa</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Semua perubahan di bawah ini akan langsung tampil secara realtime di dashboard yang dilihat mahasiswa.
          </p>
        </div>

        {loadingSettings ? (
          <div className="py-8 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-700" />
          </div>
        ) : (
          <form onSubmit={handleSaveLanding} className="space-y-6">
            
            {/* SUB-SECTION A: IDENTITAS & LOGO */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <Building className="w-4 h-4" />
                <span>1. Identitas Kampus / Sekolah &amp; Logo</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Institusi / Universitas / Sekolah <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    placeholder="Contoh: IAI TABAH LAMONGAN / UNIVERSITAS INDONESIA"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Fakultas / Jurusan / Unit <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={facultyName}
                    onChange={(e) => setFacultyName(e.target.value)}
                    placeholder="Contoh: Fakultas Tarbiyah dan Ilmu Keguruan (FTIK)"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                  />
                </div>
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Logo Institusi (Opsional - Kosongkan untuk pakai default)
                </label>
                <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
                  <input
                    type="text"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="URL gambar logo (https://...) atau klik tombol Upload"
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                  />
                  <label className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg border border-emerald-600 text-emerald-700 hover:bg-emerald-50 text-xs sm:text-sm font-medium cursor-pointer transition-colors whitespace-nowrap bg-white">
                    {uploadingLogo ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    <span>{uploadingLogo ? "Mengunggah..." : "Upload Logo"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadFile(file, "logos", setLogoUrl, setUploadingLogo, "Logo");
                      }}
                      disabled={uploadingLogo}
                      className="hidden"
                    />
                  </label>
                </div>
                {logoUrl && (
                  <div className="mt-2 p-2 rounded-lg border border-slate-200 bg-white inline-flex items-center gap-2">
                    <img
                      src={logoUrl}
                      alt="Logo Preview"
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <span className="text-[11px] text-slate-600">Logo aktif terpasang</span>
                  </div>
                )}
              </div>
            </div>

            {/* SUB-SECTION B: JUDUL PORTAL & TAHUN AKADEMIK */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4" />
                <span>2. Teks Judul &amp; Periode Akademik</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Judul Portal
                  </label>
                  <input
                    type="text"
                    required
                    value={portalTitle}
                    onChange={(e) => setPortalTitle(e.target.value)}
                    placeholder="Contoh: Portal Ujian & Penugasan Digital"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Judul Besar Banner (Headline)
                  </label>
                  <input
                    type="text"
                    required
                    value={heroHeadline}
                    onChange={(e) => setHeroHeadline(e.target.value)}
                    placeholder="Contoh: Portal Ujian & Penugasan Digital"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Periode / Tahun Akademik
                  </label>
                  <input
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    placeholder="Contoh: Tahun Akademik 2026/2027"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subjudul / Slogan Portal Mahasiswa
                </label>
                <input
                  type="text"
                  required
                  value={portalSubtitle}
                  onChange={(e) => setPortalSubtitle(e.target.value)}
                  placeholder="Contoh: Platform Evaluasi Akademik Mahasiswa Terintegrasi"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                />
              </div>

              {/* Tombol Aksi Hero */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Teks Tombol Masuk Utama (CTA)
                  </label>
                  <input
                    type="text"
                    required
                    value={ctaButtonText}
                    onChange={(e) => setCtaButtonText(e.target.value)}
                    placeholder="Contoh: Mulai Masuk & Kerjakan Soal"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Teks Catatan di Bawah Tombol (Petunjuk NIM)
                  </label>
                  <input
                    type="text"
                    value={ctaHelperText}
                    onChange={(e) => setCtaHelperText(e.target.value)}
                    placeholder="Contoh: Cukup siapkan NIM Anda yang telah didaftarkan di kelas"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* SUB-SECTION C: GAMBAR ILUSTRASI HERO */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4" />
                <span>3. Gambar Ilustrasi Hero di Sebelah Kanan</span>
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gambar Hero Kanan (Opsional - Kosongkan untuk pakai foto mahasiswi default)
                </label>
                <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
                  <input
                    type="text"
                    value={heroImageUrl}
                    onChange={(e) => setHeroImageUrl(e.target.value)}
                    placeholder="URL gambar hero (https://...) atau klik tombol Upload Hero"
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                  />
                  <label className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg border border-emerald-600 text-emerald-700 hover:bg-emerald-50 text-xs sm:text-sm font-medium cursor-pointer transition-colors whitespace-nowrap bg-white">
                    {uploadingHero ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    <span>{uploadingHero ? "Mengunggah..." : "Upload Hero"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadFile(file, "heroes", setHeroImageUrl, setUploadingHero, "Gambar Hero");
                      }}
                      disabled={uploadingHero}
                      className="hidden"
                    />
                  </label>
                </div>
                {heroImageUrl && (
                  <div className="mt-2.5 p-2 rounded-lg border border-slate-200 bg-white inline-block">
                    <p className="text-[11px] text-slate-500 mb-1 font-medium">Pratinjau Gambar Hero:</p>
                    <img
                      src={heroImageUrl}
                      alt="Preview Hero"
                      className="max-h-36 rounded border border-slate-200 object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* SUB-SECTION D: TATA TERTIB & FITUR UNGGULAN */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                <span>4. Petunjuk Tata Tertib &amp; 3 Fitur Unggulan</span>
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Judul Kotak Tata Tertib
                </label>
                <input
                  type="text"
                  required
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  placeholder="Contoh: Petunjuk & Tata Tertib Pelaksanaan Ujian"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Isi Pengumuman / Tata Tertib Ujian
                </label>
                <textarea
                  rows={4}
                  required
                  value={announcementBody}
                  onChange={(e) => setAnnouncementBody(e.target.value)}
                  placeholder="1. Pastikan koneksi internet stabil...\n2. Masukkan NIM valid..."
                  className="w-full p-3 rounded-lg border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white font-sans"
                />
              </div>

              {/* 3 Fitur Unggulan */}
              <div className="pt-2 border-t border-slate-200 space-y-3">
                <p className="text-xs font-semibold text-slate-700">3 Kartu Keunggulan Sistem di Halaman Bawah:</p>

                {/* Fitur 1 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-white rounded-lg border border-slate-200">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Judul Fitur 1</label>
                    <input
                      type="text"
                      value={feature1Title}
                      onChange={(e) => setFeature1Title(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Deskripsi Fitur 1</label>
                    <input
                      type="text"
                      value={feature1Desc}
                      onChange={(e) => setFeature1Desc(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                {/* Fitur 2 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-white rounded-lg border border-slate-200">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Judul Fitur 2</label>
                    <input
                      type="text"
                      value={feature2Title}
                      onChange={(e) => setFeature2Title(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Deskripsi Fitur 2</label>
                    <input
                      type="text"
                      value={feature2Desc}
                      onChange={(e) => setFeature2Desc(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                {/* Fitur 3 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-white rounded-lg border border-slate-200">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Judul Fitur 3</label>
                    <input
                      type="text"
                      value={feature3Title}
                      onChange={(e) => setFeature3Title(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Deskripsi Fitur 3</label>
                    <input
                      type="text"
                      value={feature3Desc}
                      onChange={(e) => setFeature3Desc(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SUB-SECTION E: FOOTER */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                <span>5. Teks Footer &amp; Hak Cipta</span>
              </h3>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keterangan Hak Cipta Footer
                </label>
                <input
                  type="text"
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value)}
                  placeholder="Contoh: Hak Cipta Dilindungi."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingLanding}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold shadow-xs cursor-pointer transition-colors"
            >
              {savingLanding ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan Pengaturan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Semua Pengaturan Tampilan Portal</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* SECTION 2: CHANGE PASSWORD */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-emerald-700" />
            <span>Keamanan &amp; Sandi Akun Dosen</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Perbarui kata sandi secara berkala untuk menjaga kerahasiaan lembar soal ujian
          </p>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Password Saat Ini <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Password Baru (Minimal 6 Karakter) <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Ulangi Password Baru <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <button
            type="submit"
            disabled={savingPassword}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold shadow-xs cursor-pointer transition-colors"
          >
            {savingPassword ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Menyimpan Sandi...</span>
              </>
            ) : (
              <span>Simpan Perubahan Sandi</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
