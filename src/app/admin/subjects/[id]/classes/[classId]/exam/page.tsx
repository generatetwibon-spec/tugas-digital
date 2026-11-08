"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FileSpreadsheet,
  Plus,
  Pencil,
  Trash2,
  Clock,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowUp,
  ArrowDown,
  Save,
  Power,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

interface QuestionItem {
  id: string;
  text: string;
  order: number;
  points: number;
}

interface ExamDetail {
  id: string;
  title: string;
  durationMinutes: number;
  minWords: number;
  isActive: boolean;
  class: {
    id: string;
    name: string;
    subject: {
      id: string;
      name: string;
    };
  };
  questions: QuestionItem[];
}

function ExamManageContent() {
  const params = useParams();
  const subjectId = params.id as string;
  const classId = params.classId as string;

  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Form State for Exam Config
  const [title, setTitle] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [minWords, setMinWords] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [savingExam, setSavingExam] = useState(false);

  // Question Modal State
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null);
  const [questionText, setQuestionText] = useState("");
  const [questionPoints, setQuestionPoints] = useState(10);
  const [savingQuestion, setSavingQuestion] = useState(false);
  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(null);

  // Fetch current exam or create form
  const fetchExam = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch exams for this class
      const res = await fetch(`/api/admin/exams?classId=${classId}`);
      if (!res.ok) throw new Error("Gagal mengambil data ujian");
      const exams = await res.json();

      if (exams && exams.length > 0) {
        // Fetch detailed single exam
        const singleRes = await fetch(`/api/admin/exams/${exams[0].id}`);
        if (singleRes.ok) {
          const detailedExam = await singleRes.json();
          setExam(detailedExam);
          setTitle(detailedExam.title);
          setDurationMinutes(detailedExam.durationMinutes);
          setMinWords(detailedExam.minWords);
          setIsActive(detailedExam.isActive);
        }
      } else {
        setExam(null);
      }
    } catch {
      toast.error("Gagal memuat pengaturan ujian");
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    if (classId) {
      fetchExam();
    }
  }, [classId, fetchExam]);

  // Handle Save / Create Exam
  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Judul ujian wajib diisi");
      return;
    }

    try {
      setSavingExam(true);
      if (exam) {
        // Update existing exam
        const res = await fetch(`/api/admin/exams/${exam.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            durationMinutes: Number(durationMinutes),
            minWords: Number(minWords),
            isActive,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal memperbarui ujian");
        toast.success("Pengaturan ujian berhasil diperbarui");
      } else {
        // Create new exam
        const res = await fetch("/api/admin/exams", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            classId,
            durationMinutes: Number(durationMinutes),
            minWords: Number(minWords),
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal membuat ujian");
        toast.success("Ujian baru berhasil dibuat");
      }
      fetchExam();
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan");
    } finally {
      setSavingExam(false);
    }
  };

  // Toggle Status Directly
  const handleToggleStatus = async () => {
    if (!exam) return;
    const newStatus = !exam.isActive;
    try {
      const res = await fetch(`/api/admin/exams/${exam.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus }),
      });
      if (res.ok) {
        setIsActive(newStatus);
        setExam({ ...exam, isActive: newStatus });
        toast.success(
          newStatus
            ? "Ujian sekarang AKTIF dan dapat diakses mahasiswa"
            : "Ujian dinonaktifkan (Tutup akses)"
        );
      } else {
        toast.error("Gagal mengubah status ujian");
      }
    } catch {
      toast.error("Gagal menghubungi server");
    }
  };

  // Question Modal Openers
  const handleOpenAddQuestion = () => {
    setEditingQuestion(null);
    setQuestionText("");
    setQuestionPoints(10);
    setIsQuestionModalOpen(true);
  };

  const handleOpenEditQuestion = (q: QuestionItem) => {
    setEditingQuestion(q);
    setQuestionText(q.text);
    setQuestionPoints(q.points);
    setIsQuestionModalOpen(true);
  };

  // Save Question
  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exam) return;
    if (!questionText.trim()) {
      toast.error("Teks soal tidak boleh kosong");
      return;
    }

    try {
      setSavingQuestion(true);
      if (editingQuestion) {
        const res = await fetch(`/api/admin/questions/${editingQuestion.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: questionText.trim(),
            points: Number(questionPoints),
          }),
        });
        if (!res.ok) throw new Error("Gagal memperbarui soal");
        toast.success("Soal berhasil diperbarui");
      } else {
        const res = await fetch("/api/admin/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            examId: exam.id,
            text: questionText.trim(),
            points: Number(questionPoints),
          }),
        });
        if (!res.ok) throw new Error("Gagal menambahkan soal");
        toast.success("Soal baru berhasil ditambahkan");
      }
      setIsQuestionModalOpen(false);
      fetchExam();
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan soal");
    } finally {
      setSavingQuestion(false);
    }
  };

  // Delete Question
  const handleDeleteQuestion = async (qId: string) => {
    if (!confirm("Hapus butir soal ini?")) return;

    try {
      setDeletingQuestionId(qId);
      const res = await fetch(`/api/admin/questions/${qId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Gagal menghapus soal");
      toast.success("Soal berhasil dihapus");
      fetchExam();
    } catch {
      toast.error("Terjadi masalah saat menghapus");
    } finally {
      setDeletingQuestionId(null);
    }
  };

  // Reorder Question (Up / Down)
  const handleMoveOrder = async (index: number, direction: "up" | "down") => {
    if (!exam) return;
    const questions = [...exam.questions];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= questions.length) return;

    const currentQ = questions[index];
    const targetQ = questions[targetIndex];

    try {
      // Swap their order numbers
      await Promise.all([
        fetch(`/api/admin/questions/${currentQ.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: targetQ.order }),
        }),
        fetch(`/api/admin/questions/${targetQ.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: currentQ.order }),
        }),
      ]);

      fetchExam();
    } catch {
      toast.error("Gagal mengubah urutan soal");
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-12 rounded-xl border border-slate-200 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-700 mb-2" />
        <p className="text-xs text-slate-500">Memuat konfigurasi ujian...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
        <Link
          href="/admin/subjects"
          className="hover:text-emerald-700 transition-colors"
        >
          Mata Kuliah
        </Link>
        <span>/</span>
        <Link
          href={`/admin/subjects/${subjectId}/classes`}
          className="hover:text-emerald-700 transition-colors"
        >
          {exam?.class.subject.name || "Daftar Kelas"}
        </Link>
        <span>/</span>
        <span className="font-semibold text-slate-800">
          Kelas {exam?.class.name || "Pengaturan Ujian"}
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Pengaturan Ujian & Soal Essay
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {exam?.class.subject.name} &bull; Kelas {exam?.class.name}
          </p>
        </div>

        {exam && (
          <button
            onClick={handleToggleStatus}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-xs cursor-pointer ${
              exam.isActive
                ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300 border border-slate-300"
            }`}
          >
            <Power className="w-4 h-4" />
            <span>
              Status: {exam.isActive ? "AKTIF (Bisa Dikerjakan)" : "NON-AKTIF (Tutup)"}
            </span>
          </button>
        )}
      </div>

      {/* Section 1: Exam Settings Form */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
          <span>Konfigurasi Ujian</span>
        </h2>

        <form onSubmit={handleSaveExam} className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Judul Ujian <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Ujian Tengah Semester (UTS) Pemrograman Web"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Durasi Ujian (Menit) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min={5}
              max={300}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Waktu hitung mundur otomatis
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Minimal Kata per Soal
            </label>
            <input
              type="number"
              min={0}
              value={minWords}
              onChange={(e) => setMinWords(Number(e.target.value))}
              placeholder="0 jika tidak ada batasan"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Isi 0 jika tidak ada syarat minimum kata
            </p>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={savingExam}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold shadow-xs cursor-pointer transition-colors"
            >
              {savingExam ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{exam ? "Perbarui Pengaturan" : "Buat Ujian Baru"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Section 2: Questions List (Only shown if exam exists) */}
      {exam ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-700" />
                <span>Daftar Butir Soal Essay ({exam.questions.length})</span>
              </h2>
              <p className="text-xs text-slate-500">
                Total Poin: {exam.questions.reduce((acc, q) => acc + q.points, 0)} Poin
              </p>
            </div>

            <button
              onClick={handleOpenAddQuestion}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Butir Soal</span>
            </button>
          </div>

          {exam.questions.length === 0 ? (
            <div className="py-10 text-center">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">Belum Ada Soal</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Silakan tambahkan butir soal essay untuk ujian ini.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {exam.questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-emerald-700 text-white text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                        Bobot: {q.points} Poin
                      </span>
                    </div>

                    <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                      {q.text}
                    </p>
                  </div>

                  {/* Actions & Reordering */}
                  <div className="flex items-center gap-1 self-end sm:self-start">
                    <button
                      disabled={idx === 0}
                      onClick={() => handleMoveOrder(idx, "up")}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed border border-transparent hover:border-slate-200 transition-colors"
                      title="Geser ke Atas"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      disabled={idx === exam.questions.length - 1}
                      onClick={() => handleMoveOrder(idx, "down")}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed border border-transparent hover:border-slate-200 transition-colors"
                      title="Geser ke Bawah"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEditQuestion(q)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white border border-transparent hover:border-slate-200 transition-colors ml-1"
                      title="Edit Soal"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      disabled={deletingQuestionId === q.id}
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                      title="Hapus Soal"
                    >
                      {deletingQuestionId === q.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 text-xs text-amber-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>
            Simpan pengaturan ujian terlebih dahulu untuk dapat menambahkan butir-butir soal essay.
          </span>
        </div>
      )}

      {/* Modal Add / Edit Question */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h2 className="text-lg font-bold text-slate-900">
              {editingQuestion ? "Edit Butir Soal" : "Tambah Butir Soal Essay"}
            </h2>

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Teks Soal Essay <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder="Tuliskan pertanyaan essay secara jelas dan rinci..."
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="w-full p-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Bobot Nilai / Poin <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={100}
                  value={questionPoints}
                  onChange={(e) => setQuestionPoints(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  disabled={savingQuestion}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingQuestion}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs"
                >
                  {savingQuestion ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Soal</span>
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

export default function ExamManagePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Memuat konfigurasi ujian...</div>}>
      <ExamManageContent />
    </Suspense>
  );
}
