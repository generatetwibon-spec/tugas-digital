"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  FileSpreadsheet,
  ArrowLeft,
  Loader2,
  FolderOpen,
  GraduationCap,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

interface ClassItem {
  id: string;
  name: string;
  _count: {
    exams: number;
    students: number;
  };
}

interface SubjectDetail {
  id: string;
  name: string;
  level: string | null;
  description: string | null;
}

function SubjectClassesContent() {
  const params = useParams();
  const router = useRouter();
  const subjectId = params.id as string;

  const [subject, setSubject] = useState<SubjectDetail | null>(null);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchData = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      // Fetch subject info & classes in parallel
      const [resSubject, resClasses] = await Promise.all([
        fetch(`/api/admin/subjects/${subjectId}`),
        fetch(`/api/admin/classes?subjectId=${subjectId}`),
      ]);

      if (resSubject.ok) {
        const subjectData = await resSubject.json();
        setSubject(subjectData);
      }
      if (resClasses.ok) {
        const classesData = await resClasses.json();
        setClasses(classesData);
      }
    } catch {
      toast.error("Gagal memuat data kelas");
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [subjectId]);

  useEffect(() => {
    if (subjectId) {
      fetchData(true);
    }
  }, [subjectId, fetchData]);

  const handleOpenAdd = () => {
    setEditingClass(null);
    setName("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: ClassItem) => {
    setEditingClass(c);
    setName(c.name);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Nama kelas wajib diisi");
      return;
    }

    try {
      setSaving(true);
      const url = editingClass
        ? `/api/admin/classes/${editingClass.id}`
        : "/api/admin/classes";
      const method = editingClass ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          subjectId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Gagal menyimpan kelas");
        return;
      }

      toast.success(
        editingClass ? "Kelas berhasil diperbarui" : "Kelas berhasil ditambahkan"
      );
      setIsModalOpen(false);
      fetchData();
    } catch {
      toast.error("Terjadi masalah saat menyimpan kelas");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (classId: string) => {
    if (
      !confirm(
        "Yakin ingin menghapus kelas ini? Semua data mahasiswa, penugasan, dan lembar jawaban di dalamnya akan ikut terhapus."
      )
    ) {
      return;
    }

    try {
      setDeletingId(classId);
      const res = await fetch(`/api/admin/classes/${classId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Gagal menghapus kelas");
        return;
      }

      toast.success("Kelas berhasil dihapus");
      fetchData();
    } catch {
      toast.error("Terjadi masalah saat menghapus kelas");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
        <Link
          href="/admin/subjects"
          className="hover:text-emerald-700 transition-colors flex items-center gap-1 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Daftar Mata Kuliah</span>
        </Link>
        <span>/</span>
        <span className="font-semibold text-slate-800">
          {subject?.name || "Memuat..."}{" "}
          {subject?.level ? `(${subject.level})` : ""}
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Pembagian Kelas: {subject?.name}
            </h1>
            {subject?.level && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                {subject.level}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tambahkan kelas paralel (misal: 5A, 5B, 5C). Klik kelas untuk menginput data mahasiswa dan mengatur soal penugasan.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kelas Baru</span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-700 mb-2" />
          <p className="text-xs text-slate-500">Memuat data kelas...</p>
        </div>
      ) : classes.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">Belum Ada Kelas</h3>
          <p className="text-xs text-slate-500 mt-1">
            Tambahkan kelas seperti 5A, 5B, atau sejenisnya untuk mulai mendaftarkan mahasiswa.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {classes.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0 font-bold text-base">
                    {c.name.slice(0, 3)}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(c)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      disabled={deletingId === c.id}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Hapus"
                    >
                      {deletingId === c.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-lg mt-3">
                  Kelas {c.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mata Kuliah: {subject?.name}
                </p>

                {/* Badges Info */}
                <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-emerald-700" />
                    <div>
                      <span className="block font-bold text-slate-800">
                        {c._count?.students ?? 0}
                      </span>
                      <span className="text-[11px] text-slate-500">Mahasiswa</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-700" />
                    <div>
                      <span className="block font-bold text-slate-800">
                        {c._count?.exams ?? 0}
                      </span>
                      <span className="text-[11px] text-slate-500">Tugas / Ujian</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href={`/admin/subjects/${subjectId}/classes/${c.id}`}
                  className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Buka Kelas (Mahasiswa & Soal)</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add / Edit Class */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h2 className="text-lg font-bold text-slate-900">
              {editingClass ? "Edit Kelas" : "Tambah Kelas Baru"}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Kelas <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: 5A, 5B, atau TI-3A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Contoh: Jika mata kuliah untuk kelas 5, masukkan nama kelas seperti &quot;5A&quot; atau &quot;5B&quot;.
                </p>
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

export default function SubjectClassesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-500">Memuat data kelas...</div>
      }
    >
      <SubjectClassesContent />
    </Suspense>
  );
}
