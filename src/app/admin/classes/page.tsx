"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  BookOpen,
  Plus,
  Search,
  ArrowRight,
  MoreVertical,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  GraduationCap,
  Loader2,
  Layers,
  FolderOpen,
} from "lucide-react";
import { toast } from "sonner";

interface ExamSummary {
  id: string;
  title: string;
  subjectName: string | null;
  isActive: boolean;
  durationMinutes: number;
}

interface ClassItem {
  id: string;
  name: string;
  level: string | null;
  description: string | null;
  createdAt: string;
  subject?: {
    id: string;
    name: string;
  } | null;
  exams?: ExamSummary[];
  _count: {
    students: number;
    exams: number;
  };
}

export default function ClassesListPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal Tambah / Edit Kelas
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [className, setClassName] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [classDescription, setClassDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Modal Hapus Kelas
  const [deletingClass, setDeletingClass] = useState<ClassItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchClasses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/classes");
      if (!res.ok) throw new Error("Gagal mengambil data kelas");
      const data = await res.json();
      setClasses(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Gagal memuat daftar kelas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const handleOpenAddModal = () => {
    setEditingClass(null);
    setClassName("");
    setClassLevel("");
    setClassDescription("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (c: ClassItem) => {
    setEditingClass(c);
    setClassName(c.name);
    setClassLevel(c.level || "");
    setClassDescription(c.description || "");
    setIsModalOpen(true);
  };

  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) {
      toast.error("Nama kelas wajib diisi");
      return;
    }

    try {
      setSubmitting(true);
      if (editingClass) {
        // Update
        const res = await fetch(`/api/admin/classes/${editingClass.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: className.trim(),
            level: classLevel.trim() || undefined,
            description: classDescription.trim() || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal memperbarui kelas");
        toast.success(`Kelas ${className} berhasil diperbarui`);
      } else {
        // Create
        const res = await fetch("/api/admin/classes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: className.trim(),
            level: classLevel.trim() || undefined,
            description: classDescription.trim() || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal membuat kelas");
        toast.success(`Kelas ${className} berhasil dibuat`);
      }

      setIsModalOpen(false);
      fetchClasses();
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClass = async () => {
    if (!deletingClass) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/admin/classes/${deletingClass.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghapus kelas");
      toast.success(`Kelas ${deletingClass.name} berhasil dihapus`);
      setDeletingClass(null);
      fetchClasses();
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus kelas");
    } finally {
      setDeleting(false);
    }
  };

  const filteredClasses = classes.filter((c) => {
    const q = search.toLowerCase();
    const matchName = c.name.toLowerCase().includes(q);
    const matchLevel = c.level?.toLowerCase().includes(q);
    const matchExams = c.exams?.some(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        (e.subjectName && e.subjectName.toLowerCase().includes(q))
    );
    return matchName || matchLevel || matchExams;
  });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-800" />
            <span>Manajemen Kelas & Penugasan</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola kotak kelas (rombel), data mahasiswa terdaftar, dan paket ujian per mata kuliah.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kelas Baru</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama kelas, semester, atau mata kuliah..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white transition-all"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
          Total: <strong className="text-slate-800">{filteredClasses.length}</strong> Kelas
        </span>
      </div>

      {/* Classes Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-500 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-800" />
          <p className="text-xs sm:text-sm">Memuat daftar kelas...</p>
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto">
            <FolderOpen className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {search ? "Kelas Tidak Ditemukan" : "Belum Ada Kelas Terdaftar"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
              {search
                ? `Tidak ada kelas yang cocok dengan kata kunci "${search}".`
                : "Buat kotak kelas pertama (misal: PAI 5 B atau TBI 5) untuk mulai menambahkan mahasiswa dan paket ujian mata kuliah."}
            </p>
          </div>
          {!search && (
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Kelas Sekarang</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClasses.map((c) => {
            const activeExamsCount = c.exams?.filter((e) => e.isActive).length || 0;
            return (
              <div
                key={c.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Card Top / Header */}
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-lg text-slate-900 tracking-tight group-hover:text-emerald-900 transition-colors">
                          Kelas {c.name}
                        </span>
                        {c.level && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {c.level}
                          </span>
                        )}
                      </div>
                      {c.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                          {c.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenEditModal(c)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Edit Informasi Kelas"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingClass(c)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Hapus Kelas"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Metrics Badges */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                        <Users className="w-3.5 h-3.5 text-emerald-800" />
                        <span>Mahasiswa</span>
                      </div>
                      <p className="text-lg font-bold text-slate-900 mt-0.5">
                        {c._count.students}
                        <span className="text-xs font-normal text-slate-500 ml-1">orang</span>
                      </p>
                    </div>

                    <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-800" />
                        <span>Mata Kuliah / Ujian</span>
                      </div>
                      <p className="text-lg font-bold text-slate-900 mt-0.5">
                        {c._count.exams}
                        {activeExamsCount > 0 && (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded ml-1 border border-emerald-200">
                            {activeExamsCount} aktif
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Preview Exams in this class */}
                  {c.exams && c.exams.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 space-y-1.5">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Daftar Penugasan:
                      </p>
                      <div className="space-y-1">
                        {c.exams.slice(0, 3).map((ex) => (
                          <div
                            key={ex.id}
                            className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-50/60 text-slate-700"
                          >
                            <span className="truncate font-medium flex-1">
                              {ex.subjectName ? `${ex.subjectName} — ` : ""}
                              {ex.title}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0 ml-2 ${
                                ex.isActive
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-slate-200 text-slate-600"
                              }`}
                            >
                              {ex.isActive ? "Bisa Dikerjakan" : "Tutup"}
                            </span>
                          </div>
                        ))}
                        {c.exams.length > 3 && (
                          <p className="text-[10px] text-slate-400 italic pl-1">
                            +{c.exams.length - 3} penugasan lainnya...
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Bottom CTA Link */}
                <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    Kelola data & soal
                  </span>
                  <Link
                    href={`/admin/classes/${c.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 group-hover:translate-x-0.5 transition-all"
                  >
                    <span>Masuk Kelas</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Tambah / Edit Kelas */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {editingClass ? `Edit Kelas: ${editingClass.name}` : "Tambah Kelas Baru"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {editingClass
                  ? "Perbarui identitas kelas atau rombel mahasiswa ini."
                  : "Buat kotak rombel kelas (misal: PAI 5A, TBI 5, dsb). Mahasiswa dan mata kuliah akan dikelola di dalam kelas ini."}
              </p>
            </div>

            <form onSubmit={handleSaveClass} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Kelas / Rombel <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="Contoh: PAI 5A, TBI 5, Kelas 1B"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tingkat / Semester (Opsional)
                </label>
                <input
                  type="text"
                  value={classLevel}
                  onChange={(e) => setClassLevel(e.target.value)}
                  placeholder="Contoh: Semester 5, Tingkat 1"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keterangan Tambahan (Opsional)
                </label>
                <textarea
                  value={classDescription}
                  onChange={(e) => setClassDescription(e.target.value)}
                  placeholder="Contoh: Rombel gabungan Prodi PAI Semester Ganjil 2026"
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingClass ? "Simpan Perubahan" : "Buat Kelas"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Kelas */}
      {deletingClass && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">
                Hapus Kelas {deletingClass.name}?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Tindakan ini akan menghapus data kelas beserta <strong>{deletingClass._count.students} mahasiswa</strong> dan <strong>{deletingClass._count.exams} penugasan</strong> di dalamnya. Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingClass(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteClass}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white text-xs font-semibold cursor-pointer"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Ya, Hapus Kelas</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
