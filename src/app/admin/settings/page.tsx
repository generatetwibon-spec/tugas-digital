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
} from "lucide-react";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  // Password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // Landing Setting states
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [universityName, setUniversityName] = useState("");
  const [portalTitle, setPortalTitle] = useState("");
  const [portalSubtitle, setPortalSubtitle] = useState("");
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementBody, setAnnouncementBody] = useState("");
  const [bannerImageUrl, setBannerImageUrl] = useState("");
  const [savingLanding, setSavingLanding] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const handleBannerFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "banners");

    try {
      setUploadingBanner(true);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengunggah gambar");

      setBannerImageUrl(data.url);
      toast.success("Gambar banner berhasil diunggah ke Supabase Storage!");
    } catch (err: any) {
      toast.error(err.message || "Gagal mengunggah file");
    } finally {
      setUploadingBanner(false);
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
            setUniversityName(data.setting.universityName || "");
            setPortalTitle(data.setting.portalTitle || "");
            setPortalSubtitle(data.setting.portalSubtitle || "");
            setAnnouncementTitle(data.setting.announcementTitle || "");
            setAnnouncementBody(data.setting.announcementBody || "");
            setBannerImageUrl(data.setting.bannerImageUrl || "");
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
          universityName,
          portalTitle,
          portalSubtitle,
          announcementTitle,
          announcementBody,
          bannerImageUrl: bannerImageUrl.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan pengaturan");

      toast.success("Tampilan portal mahasiswa berhasil diperbarui!");
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
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Pengaturan & Tampilan Portal
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Ubah teks pengumuman halaman mahasiswa, atur foto banner, dan kelola kata sandi akun dosen
        </p>
      </div>

      {/* SECTION 1: CUSTOM CMS PORTAL MAHASISWA */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <LayoutTemplate className="w-4 h-4 text-emerald-700" />
            <span>Kustomisasi Halaman Depan Mahasiswa</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Teks dan banner di bawah ini akan langsung tampil di halaman depan yang dibuka mahasiswa.
          </p>
        </div>

        {loadingSettings ? (
          <div className="py-8 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-700" />
          </div>
        ) : (
          <form onSubmit={handleSaveLanding} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama Universitas / Fakultas
                </label>
                <input
                  type="text"
                  value={universityName}
                  onChange={(e) => setUniversityName(e.target.value)}
                  placeholder="Contoh: Universitas Indonesia, Fakultas Ilmu Komputer"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Judul Portal Ujian
                </label>
                <input
                  type="text"
                  value={portalTitle}
                  onChange={(e) => setPortalTitle(e.target.value)}
                  placeholder="Contoh: Portal Ujian & Penugasan Digital"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Subjudul / Keterangan Portal
              </label>
              <input
                type="text"
                value={portalSubtitle}
                onChange={(e) => setPortalSubtitle(e.target.value)}
                placeholder="Deskripsi singkat yang tampil di bawah judul utama..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Judul Kotak Pengumuman / Tata Tertib
              </label>
              <input
                type="text"
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
                placeholder="Contoh: Petunjuk & Tata Tertib Pelaksanaan Ujian"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Isi Pengumuman / Tata Tertib (Bisa Multi Baris)
              </label>
              <textarea
                rows={4}
                value={announcementBody}
                onChange={(e) => setAnnouncementBody(e.target.value)}
                placeholder="1. Masukkan NIM untuk verifikasi...\n2. Kerjakan dengan mandiri..."
                className="w-full p-3 rounded-lg border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Foto Banner / Gambar Kampus (Opsional)
              </label>
              <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
                <input
                  type="text"
                  value={bannerImageUrl}
                  onChange={(e) => setBannerImageUrl(e.target.value)}
                  placeholder="https://... atau klik tombol Upload File"
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                <label className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg border border-emerald-600 text-emerald-700 hover:bg-emerald-50 text-xs sm:text-sm font-medium cursor-pointer transition-colors whitespace-nowrap">
                  {uploadingBanner ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>{uploadingBanner ? "Mengunggah..." : "Upload File"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerFileUpload}
                    disabled={uploadingBanner}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                File akan disimpan langsung secara cloud di Supabase Storage bucket <code>exam-attachments</code>.
              </p>
              {bannerImageUrl && (
                <div className="mt-2.5 p-2 rounded-lg border border-slate-200 bg-slate-50 inline-block">
                  <p className="text-[11px] text-slate-500 mb-1 font-medium">Pratinjau Banner:</p>
                  <img
                    src={bannerImageUrl}
                    alt="Preview Banner"
                    className="max-h-36 rounded border border-slate-200 object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={savingLanding}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold shadow-xs cursor-pointer transition-colors"
            >
              {savingLanding ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan Pengaturan...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Tampilan Portal Mahasiswa</span>
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
            <span>Keamanan & Sandi Akun Dosen</span>
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
