"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  FolderOpen,
  Loader2,
  Search,
  GraduationCap,
  Layers,
} from "lucide-react";
import { toast } from "sonner";

interface SubjectItem {
  id: string;
  name: string;
  level: string | null;
  description: string | null;
  createdAt: string;
  _count: {
    classes: number;
  };
}

function SubjectsContent() {
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectItem | null>(null);
  const [name, setName] = useState("");
  const [level, setLevel] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchSubjects = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/subjects");
      if (!res.ok) throw new Error("Gagal mengambil data");
      const data = await res.json();
      setSubjects(data);
    } catch {
      toast.error("Gagal memuat daftar penugasan");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const handleOpenAdd = () => {
    setEditingSubject(null);
    setName("");
    setLevel("Kelas 5");
    setDescription("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (subject: SubjectItem) => {
    setEditingSubject(subject);
    setName(subject.name);
    setLevel(subject.level || "");
    setDescription(subject.description || "");
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Nama mata kuliah wajib diisi");
      return;
    }

    try {
      setSaving(true);
      const url = editingSubject
        ? `/api/admin/subjects/${editingSubject.id}`
        : "/api/admin/subjects";
      const method = editingSubject ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          level: level.trim() || undefined,
          description: description.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Gagal menyimpan mata kuliah");
        return;
      }

      toast.success(
        editingSubject
          ? "Mata kuliah berhasil diperbarui"
          : "Mata kuliah berhasil ditambahkan"
      );
      setIsModalOpen(false);
      fetchSubjects();
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Yakin ingin menghapus mata kuliah ini? Semua kelas, data mahasiswa, penugasan, dan jawaban di dalamnya akan ikut terhapus."
      )
    ) {
      return;
    }

    try {
      setDeletingId(id);
      const res = await fetch(`/api/admin/subjects/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Gagal menghapus mata kuliah");
        return;
      }

      toast.success("Mata kuliah berhasil dihapus");
      fetchSubjects();
    } catch {
      toast.error("Terjadi masalah saat menghapus");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredSubjects = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.level && s.level.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Penugasan & Mata Kuliah
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Daftar mata kuliah berdasarkan tingkatan kelas (misal: Kelas 5, Semester 3). Masuk ke dalam card untuk mengelola kelas dan mahasiswanya.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Mata Kuliah</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Cari mata kuliah atau tingkatan kelas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
        />
      </div>

      {/* Content Table / Cards */}
      {loading ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-700 mb-2" />
          <p className="text-xs text-slate-500">Memuat data...</p>
        </div>
      ) : filteredSubjects.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">Belum Ada Mata Kuliah</h3>
          <p className="text-xs text-slate-500 mt-1">
            Klik tombol &quot;Tambah Mata Kuliah&quot; untuk menambahkan mata pelajaran dan mengatur tingkatan kelasnya.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSubjects.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(s)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      disabled={deletingId === s.id}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Hapus"
                    >
                      {deletingId === s.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Level / Tingkat Badge */}
                {s.level && (
                  <span className="inline-block mt-3 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-800">
                    {s.level}
                  </span>
                )}

                <h3 className="font-bold text-slate-900 text-base mt-1.5">
                  {s.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {s.description || "Tidak ada keterangan khusus"}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                  {s._count.classes} Kelas Terdaftar
                </span>

                <Link
                  href={`/admin/subjects/${s.id}/classes`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Buka Kelas</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add / Edit Subject */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h2 className="text-lg font-bold text-slate-900">
              {editingSubject ? "Edit Mata Kuliah" : "Tambah Mata Kuliah Baru"}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Mata Kuliah / Materi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pemrograman Web, Matematika Diskrit"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Tingkatan / Level Kelas
                </label>
                <input
                  type="text"
                  placeholder="Misal: Kelas 5, Tingkat 2, atau Semester 5"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Membantu mengelompokkan mata kuliah per tingkatan kelas
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Keterangan / Deskripsi (Opsional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Keterangan singkat materi atau topik..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SubjectsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-500">
          Memuat daftar penugasan...
        </div>
      }
    >
      <SubjectsContent />
    </Suspense>
  );
}
