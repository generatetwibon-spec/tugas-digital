"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Plus,
  Trash2,
  FileText,
  Clock,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Eye,
  Power,
  Pencil,
  ArrowUp,
  ArrowDown,
  Upload,
  Image as ImageIcon,
  Save,
  Check,
  ClipboardList,
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface StudentRow {
  id: string;
  nim: string;
  name: string;
  createdAt: string;
  examsStatus: {
    examId: string;
    examTitle: string;
    status: "belum" | "sedang_mengerjakan" | "selesai";
    submittedAt: string | null;
    sessionId: string | null;
  }[];
}

interface QuestionItem {
  id: string;
  text: string;
  order: number;
  points: number;
  allowFileUpload: boolean;
  fileRequired: boolean;
}

interface ExamItem {
  id: string;
  title: string;
  durationMinutes: number;
  minWords: number;
  isActive: boolean;
  questions: QuestionItem[];
  _count?: {
    questions: number;
    sessions: number;
  };
}

interface ClassMeta {
  id: string;
  name: string;
  subject: {
    id: string;
    name: string;
    level: string | null;
  };
}

function ClassHubContent() {
  const params = useParams();
  const subjectId = params.id as string;
  const classId = params.classId as string;

  // Active Tab: 'students' | 'assignments'
  const [activeTab, setActiveTab] = useState<"students" | "assignments">("students");

  const [classMeta, setClassMeta] = useState<ClassMeta | null>(null);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Student Modals
  const [isAddStudentModal, setIsAddStudentModal] = useState(false);
  const [inputMode, setInputMode] = useState<"single" | "bulk">("single");
  const [singleNim, setSingleNim] = useState("");
  const [singleName, setSingleName] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [savingStudent, setSavingStudent] = useState(false);

  // Edit Student State
  const [isEditStudentModal, setIsEditStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentRow | null>(null);
  const [editStudentNim, setEditStudentNim] = useState("");
  const [editStudentName, setEditStudentName] = useState("");
  const [savingEditStudent, setSavingEditStudent] = useState(false);

  // Assignment / Exam Modals
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<ExamItem | null>(null);
  const [examTitle, setExamTitle] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [minWords, setMinWords] = useState(0);
  const [savingExam, setSavingExam] = useState(false);

  // Question Modal
  const [selectedExamForQuestion, setSelectedExamForQuestion] = useState<ExamItem | null>(null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null);
  const [questionText, setQuestionText] = useState("");
  const [questionPoints, setQuestionPoints] = useState(10);
  const [allowFileUpload, setAllowFileUpload] = useState(false);
  const [savingQuestion, setSavingQuestion] = useState(false);

  // Selected Exam for viewing questions inside Tab 2
  const [activeExamId, setActiveExamId] = useState<string | null>(null);

  // Fetch Class Metadata, Students, and Exams
  const loadClassData = useCallback(async () => {
    try {
      setLoading(true);
      // 1. Fetch Class & Subject
      const resClass = await fetch(`/api/admin/classes/${classId}`);
      if (!resClass.ok) throw new Error("Gagal memuat info kelas");
      const classData = await resClass.json();
      setClassMeta(classData);

      // 2. Fetch Students & their statuses
      const resStudents = await fetch(`/api/admin/classes/${classId}/students`);
      if (resStudents.ok) {
        const studentData = await resStudents.json();
        setStudents(studentData.students || []);
      }

      // 3. Fetch Exams & Questions for this class
      const resExams = await fetch(`/api/admin/exams?classId=${classId}`);
      if (resExams.ok) {
        const examsData = await resExams.json();
        // Fetch detailed questions for each exam
        const detailedExams: ExamItem[] = await Promise.all(
          examsData.map(async (e: any) => {
            const singleRes = await fetch(`/api/admin/exams/${e.id}`);
            if (singleRes.ok) {
              return await singleRes.json();
            }
            return { ...e, questions: [] };
          })
        );
        setExams(detailedExams);
        if (detailedExams.length > 0 && !activeExamId) {
          setActiveExamId(detailedExams[0].id);
        }
      }
    } catch {
      toast.error("Gagal memuat data kelas");
    } finally {
      setLoading(false);
    }
  }, [classId, activeExamId]);

  useEffect(() => {
    if (classId) {
      loadClassData();
    }
  }, [classId, loadClassData]);

  // Handle Save Student (Single or Bulk)
  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingStudent(true);
      const payload =
        inputMode === "single"
          ? { nim: singleNim.trim(), name: singleName.trim() }
          : { bulkText };

      const res = await fetch(`/api/admin/classes/${classId}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan mahasiswa");

      toast.success(
        inputMode === "single"
          ? "Mahasiswa berhasil ditambahkan"
          : data.message || "Mahasiswa massal berhasil ditambahkan"
      );
      setIsAddStudentModal(false);
      setSingleNim("");
      setSingleName("");
      setBulkText("");
      loadClassData();
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan");
    } finally {
      setSavingStudent(false);
    }
  };

  // Delete Student
  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm("Hapus mahasiswa ini dari kelas?")) return;
    try {
      const res = await fetch(
        `/api/admin/classes/${classId}/students?studentId=${studentId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        toast.success("Mahasiswa berhasil dihapus");
        loadClassData();
      } else {
        toast.error("Gagal menghapus mahasiswa");
      }
    } catch {
      toast.error("Terjadi masalah jaringan");
    }
  };

  // Open Edit Student Modal
  const handleOpenEditStudent = (student: StudentRow) => {
    setEditingStudent(student);
    setEditStudentNim(student.nim);
    setEditStudentName(student.name);
    setIsEditStudentModal(true);
  };

  // Save Edit Student
  const handleSaveEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent || !editStudentNim.trim() || !editStudentName.trim()) {
      toast.error("NIM dan Nama mahasiswa wajib diisi");
      return;
    }

    try {
      setSavingEditStudent(true);
      const res = await fetch(`/api/admin/classes/${classId}/students`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: editingStudent.id,
          nim: editStudentNim.trim(),
          name: editStudentName.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memperbarui data mahasiswa");

      toast.success("Data mahasiswa berhasil diperbarui");
      setIsEditStudentModal(false);
      loadClassData();
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan");
    } finally {
      setSavingEditStudent(false);
    }
  };

  // Reset Student Exam Session (Testing / Retake support)
  const handleResetStudentSession = async (sessionId: string, studentName: string) => {
    if (
      !confirm(
        `Yakin ingin mereset sesi pengerjaan mahasiswa ${studentName}?\n\nLembar jawaban lama akan dihapus dan mahasiswa dapat memulai ujian kembali dari awal.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/answers?sessionId=${sessionId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mereset sesi ujian");

      toast.success("Sesi ujian mahasiswa berhasil direset");
      loadClassData();
    } catch (err: any) {
      toast.error(err.message || "Gagal mereset sesi ujian");
    }
  };

  // Delete Exam / Assignment
  const handleDeleteExam = async (exam: ExamItem) => {
    if (
      !confirm(
        `Yakin ingin menghapus penugasan "${exam.title}"?\n\nSemua butir soal dan seluruh riwayat jawaban mahasiswa untuk penugasan ini akan terhapus secara permanen.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/exams/${exam.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghapus penugasan");

      toast.success(`Penugasan "${exam.title}" berhasil dihapus`);
      if (activeExamId === exam.id) {
        setActiveExamId(null);
      }
      loadClassData();
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus penugasan");
    }
  };

  // Handle Save / Edit Assignment / Exam
  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle.trim()) {
      toast.error("Judul penugasan / ujian wajib diisi");
      return;
    }

    try {
      setSavingExam(true);
      const url = editingExam
        ? `/api/admin/exams/${editingExam.id}`
        : "/api/admin/exams";
      const method = editingExam ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: examTitle.trim(),
          classId,
          durationMinutes: Number(durationMinutes),
          minWords: Number(minWords),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan penugasan");

      toast.success(
        editingExam
          ? "Penugasan berhasil diperbarui"
          : "Penugasan baru berhasil dibuat"
      );
      setIsExamModalOpen(false);
      loadClassData();
    } catch (err: any) {
      toast.error(err.message || "Terjadi masalah");
    } finally {
      setSavingExam(false);
    }
  };

  // Toggle Exam Active Status
  const handleToggleExamStatus = async (exam: ExamItem) => {
    const newStatus = !exam.isActive;
    try {
      const res = await fetch(`/api/admin/exams/${exam.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus }),
      });
      if (res.ok) {
        toast.success(
          newStatus
            ? `Penugasan "${exam.title}" sekarang AKTIF (Bisa diakses mahasiswa)`
            : `Penugasan "${exam.title}" DINONAKTIFKAN (Tutup)`
        );
        loadClassData();
      }
    } catch {
      toast.error("Gagal mengubah status penugasan");
    }
  };

  // Question Modal Openers
  const handleOpenAddQuestion = (exam: ExamItem) => {
    setSelectedExamForQuestion(exam);
    setEditingQuestion(null);
    setQuestionText("");
    setQuestionPoints(10);
    setAllowFileUpload(false);
    setIsQuestionModalOpen(true);
  };

  const handleOpenEditQuestion = (exam: ExamItem, q: QuestionItem) => {
    setSelectedExamForQuestion(exam);
    setEditingQuestion(q);
    setQuestionText(q.text);
    setQuestionPoints(q.points);
    setAllowFileUpload(q.allowFileUpload);
    setIsQuestionModalOpen(true);
  };

  // Save Question
  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExamForQuestion || !questionText.trim()) return;

    try {
      setSavingQuestion(true);
      const url = editingQuestion
        ? `/api/admin/questions/${editingQuestion.id}`
        : "/api/admin/questions";
      const method = editingQuestion ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: selectedExamForQuestion.id,
          text: questionText.trim(),
          points: Number(questionPoints),
          allowFileUpload,
        }),
      });

      if (!res.ok) throw new Error("Gagal menyimpan butir soal");

      toast.success(
        editingQuestion ? "Soal berhasil diperbarui" : "Soal baru ditambahkan"
      );
      setIsQuestionModalOpen(false);
      loadClassData();
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan soal");
    } finally {
      setSavingQuestion(false);
    }
  };

  // Delete Question
  const handleDeleteQuestion = async (qId: string) => {
    if (!confirm("Hapus soal ini?")) return;
    try {
      await fetch(`/api/admin/questions/${qId}`, { method: "DELETE" });
      toast.success("Soal berhasil dihapus");
      loadClassData();
    } catch {
      toast.error("Gagal menghapus soal");
    }
  };

  // Reorder Question
  const handleMoveQuestionOrder = async (
    exam: ExamItem,
    index: number,
    direction: "up" | "down"
  ) => {
    const questions = [...exam.questions];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= questions.length) return;

    const currentQ = questions[index];
    const targetQ = questions[targetIndex];

    try {
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
      loadClassData();
    } catch {
      toast.error("Gagal mengubah urutan");
    }
  };

  // Download PDF from student row
  const handleDownloadStudentPDF = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/exam/${sessionId}/questions`);
      if (!res.ok) throw new Error("Gagal mengambil lembar jawaban");
      const data = await res.json();

      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      doc.setFillColor(5, 150, 105);
      doc.rect(0, 0, 210, 24, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("LEMBAR JAWABAN TUGAS / UJIAN DIGITAL", 105, 11, { align: "center" });
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("Portal Evaluasi Akademik Resmi", 105, 17, { align: "center" });

      const meta = [
        ["Nama Mahasiswa", `: ${data.studentName}`, "Mata Kuliah", `: ${classMeta?.subject.name}`],
        ["NIM", `: ${data.studentNim}`, "Kelas", `: Kelas ${classMeta?.name}`],
        ["Judul Penugasan", `: ${data.examTitle}`, "Tanggal Selesai", `: ${new Date().toLocaleString("id-ID")}`],
      ];

      autoTable(doc, {
        body: meta,
        startY: 28,
        theme: "plain",
        styles: { fontSize: 9, cellPadding: 1.5, textColor: [40, 40, 40] },
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 32 },
          1: { cellWidth: 70 },
          2: { fontStyle: "bold", cellWidth: 28 },
          3: { cellWidth: 60 },
        },
      });

      let currentY = (doc as any).lastAutoTable.finalY + 4;
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(14, currentY, 196, currentY);
      currentY += 6;

      const answerRows = data.questions.map((q: any, idx: number) => {
        const fileInfo = q.answer?.fileName ? `\n[FILE TERLAMPIR]: ${q.answer.fileName} (${q.answer.fileUrl})` : "";
        return [
          `Soal No. ${idx + 1} (${q.points} Poin)\n${q.text}\n\n[JAWABAN]:\n${q.answer?.answer || "(Tidak ada teks jawaban)"}${fileInfo}`,
        ];
      });

      autoTable(doc, {
        body: answerRows,
        startY: currentY,
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 4, textColor: [30, 30, 30], overflow: "linebreak" },
      });

      doc.save(`Jawaban_${data.studentNim}_${data.studentName.replace(/\s+/g, "_")}.pdf`);
      toast.success("Lembar jawaban PDF berhasil diunduh");
    } catch {
      toast.error("Gagal mengunduh file PDF");
    }
  };

  const activeExam = exams.find((e) => e.id === activeExamId);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
        <Link href="/admin/subjects" className="hover:text-emerald-700 font-medium">
          Penugasan & Mapel
        </Link>
        <span>/</span>
        <Link
          href={`/admin/subjects/${subjectId}/classes`}
          className="hover:text-emerald-700 font-medium"
        >
          {classMeta?.subject.name}
        </Link>
        <span>/</span>
        <span className="font-semibold text-slate-800">
          Kelas {classMeta?.name}
        </span>
      </div>

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Manajemen Kelas {classMeta?.name}
            </h1>
            {classMeta?.subject.level && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                {classMeta.subject.level}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Mata Kuliah: <strong>{classMeta?.subject.name}</strong> &bull; Total {students.length} Mahasiswa Terdaftar &bull; {exams.length} Penugasan
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 self-start md:self-auto">
          <button
            onClick={() => setActiveTab("students")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "students"
                ? "bg-white text-emerald-800 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users className="w-4 h-4 text-emerald-700" />
            <span>Data Mahasiswa ({students.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("assignments")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "assignments"
                ? "bg-white text-emerald-800 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ClipboardList className="w-4 h-4 text-emerald-700" />
            <span>Penugasan & Soal ({exams.length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DATA MAHASISWA & STATUS PENGERJAAN                                 */}
      {/* ========================================================================= */}
      {activeTab === "students" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Daftar Mahasiswa Kelas {classMeta?.name}
              </h2>
              <p className="text-xs text-slate-500">
                Mahasiswa yang didaftarkan di sini cukup memasukkan NIM di portal ujian untuk verifikasi otomatis.
              </p>
            </div>

            <button
              onClick={() => {
                setInputMode("single");
                setIsAddStudentModal(true);
              }}
              className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-xs cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Mahasiswa (Single / Massal)</span>
            </button>
          </div>

          {loading ? (
            <div className="bg-white p-12 rounded-xl border border-slate-200 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-700 mb-2" />
              <p className="text-xs text-slate-500">Memuat data mahasiswa...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-700">Belum Ada Mahasiswa</h3>
              <p className="text-xs text-slate-500 mt-1">
                Silakan tambahkan data mahasiswa (NIM & Nama) agar mahasiswa dapat mengerjakan ujian secara mandiri.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-4 w-12">No</th>
                      <th className="py-3.5 px-4">NIM</th>
                      <th className="py-3.5 px-4">Nama Mahasiswa</th>
                      <th className="py-3.5 px-4">Status Penugasan / Ujian</th>
                      <th className="py-3.5 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {students.map((student, idx) => (
                      <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 text-slate-400 font-mono text-xs">
                          {idx + 1}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          {student.nim}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          {student.name}
                        </td>
                        <td className="py-3.5 px-4">
                          {student.examsStatus.length === 0 ? (
                            <span className="text-slate-400 text-xs italic">
                              Belum ada penugasan aktif
                            </span>
                          ) : (
                            <div className="space-y-1.5">
                              {student.examsStatus.map((st) => (
                                <div key={st.examId} className="flex items-center gap-2">
                                  <span className="text-[11px] text-slate-600 font-medium truncate max-w-[150px]">
                                    {st.examTitle}:
                                  </span>
                                  {st.status === "selesai" ? (
                                    <div className="inline-flex items-center gap-1.5 flex-wrap">
                                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                        <span>Selesai</span>
                                      </span>
                                      {st.sessionId && (
                                        <>
                                          <button
                                            onClick={() => handleDownloadStudentPDF(st.sessionId!)}
                                            className="text-[10px] font-semibold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
                                          >
                                            Unduh PDF
                                          </button>
                                          <button
                                            onClick={() => handleResetStudentSession(st.sessionId!, student.name)}
                                            className="text-[10px] font-semibold text-red-600 hover:text-red-800 underline cursor-pointer ml-1"
                                            title="Reset ujian agar mahasiswa bisa mengerjakan ulang"
                                          >
                                            Reset
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  ) : st.status === "sedang_mengerjakan" ? (
                                    <div className="inline-flex items-center gap-1.5 flex-wrap">
                                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                        <Clock className="w-3 h-3 text-amber-600" />
                                        <span>Sedang Dikerjakan</span>
                                      </span>
                                      {st.sessionId && (
                                        <button
                                          onClick={() => handleResetStudentSession(st.sessionId!, student.name)}
                                          className="text-[10px] font-semibold text-red-600 hover:text-red-800 underline cursor-pointer ml-1"
                                          title="Reset pengerjaan jika laptop mahasiswa mati/bermasalah"
                                        >
                                          Reset
                                        </button>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-[10px] text-slate-400">
                                      Belum Mengerjakan
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEditStudent(student)}
                              className="p-1.5 text-slate-400 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors"
                              title="Edit Mahasiswa"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(student.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                              title="Hapus Mahasiswa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PENUGASAN & BUTIR SOAL ESSAY (MULTI-EXAM / MULTI-ASSIGNMENT)       */}
      {/* ========================================================================= */}
      {activeTab === "assignments" && (
        <div className="space-y-6">
          {/* Header Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Daftar Penugasan & Soal Ujian (Kelas {classMeta?.name})
              </h2>
              <p className="text-xs text-slate-500">
                Anda dapat membuat lebih dari satu penugasan (misal: Tugas 1, Tugas 2, UTS). Setiap penugasan memiliki paket soal masing-masing.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingExam(null);
                setExamTitle("Tugas 1: Analisis Mandiri");
                setDurationMinutes(90);
                setMinWords(0);
                setIsExamModalOpen(true);
              }}
              className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-xs cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Penugasan Baru</span>
            </button>
          </div>

          {exams.length === 0 ? (
            <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
              <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-700">Belum Ada Penugasan / Ujian</h3>
              <p className="text-xs text-slate-500 mt-1">
                Klik tombol &quot;Buat Penugasan Baru&quot; untuk menambahkan topik tugas atau paket soal UTS.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: List of Assignments */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                  Pilih Paket Penugasan:
                </span>
                {exams.map((e) => {
                  const isSelected = e.id === activeExamId;
                  return (
                    <div
                      key={e.id}
                      onClick={() => setActiveExamId(e.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-white border-emerald-600 shadow-md ring-1 ring-emerald-600"
                          : "bg-white border-slate-200 hover:border-slate-300 shadow-xs"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <h4 className="font-bold text-slate-900 text-sm">
                            {e.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>Durasi: {e.durationMinutes} Menit</span>
                            <span>&bull;</span>
                            <span>{e.questions.length} Butir Soal</span>
                          </div>
                        </div>

                        {/* Status Toggle */}
                        <button
                          type="button"
                          onClick={(ev) => {
                            ev.stopPropagation();
                            handleToggleExamStatus(e);
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                            e.isActive
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {e.isActive ? "AKTIF" : "TUTUP"}
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-[11px] text-slate-500">
                        <span>Min Kata: {e.minWords > 0 ? `${e.minWords} kata` : "Bebas"}</span>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={(ev) => {
                              ev.stopPropagation();
                              setEditingExam(e);
                              setExamTitle(e.title);
                              setDurationMinutes(e.durationMinutes);
                              setMinWords(e.minWords);
                              setIsExamModalOpen(true);
                            }}
                            className="font-semibold text-emerald-700 hover:underline cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={(ev) => {
                              ev.stopPropagation();
                              handleDeleteExam(e);
                            }}
                            className="font-semibold text-red-600 hover:underline cursor-pointer"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Questions of Selected Assignment */}
              <div className="lg:col-span-2 space-y-4">
                {activeExam ? (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900">
                            {activeExam.title} &mdash; Soal ({activeExam.questions.length})
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              activeExam.isActive
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {activeExam.isActive ? "Bisa Dikerjakan" : "Non-Aktif"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Total Poin: {activeExam.questions.reduce((a, b) => a + b.points, 0)} Poin &bull; Durasi: {activeExam.durationMinutes} Menit
                        </p>
                      </div>

                      <button
                        onClick={() => handleOpenAddQuestion(activeExam)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Butir Soal</span>
                      </button>
                    </div>

                    {activeExam.questions.length === 0 ? (
                      <div className="py-12 text-center">
                        <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-slate-700">
                          Belum Ada Butir Soal
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Tambahkan soal essay untuk penugasan ini. Anda juga bisa menyalakan switch upload file jika soal membutuhkan diagram atau lampiran.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {activeExam.questions.map((q, idx) => (
                          <div
                            key={q.id}
                            className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                          >
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="w-6 h-6 rounded-md bg-emerald-700 text-white text-xs font-bold flex items-center justify-center">
                                  {idx + 1}
                                </span>
                                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                                  Bobot: {q.points} Poin
                                </span>

                                {/* Switch Badge */}
                                {q.allowFileUpload ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                                    <Upload className="w-3 h-3" />
                                    <span>Upload Diagram / File Diaktifkan</span>
                                  </span>
                                ) : (
                                  <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                    Teks Essay Murni
                                  </span>
                                )}
                              </div>

                              <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed font-sans">
                                {q.text}
                              </p>
                            </div>

                            <div className="flex items-center gap-1 self-end sm:self-start">
                              <button
                                disabled={idx === 0}
                                onClick={() => handleMoveQuestionOrder(activeExam, idx, "up")}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed border border-transparent hover:border-slate-200"
                                title="Geser ke Atas"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                disabled={idx === activeExam.questions.length - 1}
                                onClick={() => handleMoveQuestionOrder(activeExam, idx, "down")}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed border border-transparent hover:border-slate-200"
                                title="Geser ke Bawah"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleOpenEditQuestion(activeExam, q)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white border border-transparent hover:border-slate-200 ml-1"
                                title="Edit Soal"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteQuestion(q.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200"
                                title="Hapus Soal"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
                    Pilih salah satu penugasan di sebelah kiri untuk melihat dan mengelola soal.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: TAMBAH MAHASISWA (SINGLE & BULK PASTE EXCEL)                     */}
      {/* ========================================================================= */}
      {isAddStudentModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h2 className="text-lg font-bold text-slate-900">
              Input Data Mahasiswa &mdash; Kelas {classMeta?.name}
            </h2>

            {/* Toggle Mode */}
            <div className="flex rounded-lg bg-slate-100 p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setInputMode("single")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  inputMode === "single"
                    ? "bg-white text-emerald-800 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Input Satu Mahasiswa
              </button>
              <button
                type="button"
                onClick={() => setInputMode("bulk")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  inputMode === "bulk"
                    ? "bg-white text-emerald-800 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Paste Massal (Excel / Word)
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-4">
              {inputMode === "single" ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      NIM Mahasiswa <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: 2101001"
                      value={singleNim}
                      onChange={(e) => setSingleNim(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Nama Lengkap Mahasiswa <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Ahmad Fauzi"
                      value={singleName}
                      onChange={(e) => setSingleName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Paste Data NIM & Nama (1 Baris per Mahasiswa)
                  </label>
                  <textarea
                    rows={8}
                    required
                    placeholder={`2101001, Ahmad Fauzi\n2101002, Budi Santoso\n2101003, Citra Lestari\n(Bisa langsung copy dari kolom NIM & Nama di Excel lalu paste di sini)`}
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    className="w-full p-3 rounded-lg border border-slate-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600 leading-relaxed"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Format yang didukung: <code>NIM, NAMA</code> atau dipisahkan oleh Tab dari Microsoft Excel.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddStudentModal(false)}
                  disabled={savingStudent}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingStudent}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  {savingStudent ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Mahasiswa</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: BUAT / EDIT PENUGASAN (EXAM / ASSIGNMENT)                        */}
      {/* ========================================================================= */}
      {isExamModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h2 className="text-lg font-bold text-slate-900">
              {editingExam ? "Edit Pengaturan Penugasan" : "Buat Penugasan / Ujian Baru"}
            </h2>

            <form onSubmit={handleSaveExam} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Judul Penugasan / Topik <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Tugas 1: ERD & Arsitektur, UTS Digital"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Durasi Pengerjaan (Menit) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={5}
                  max={600}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Syarat Minimal Kata per Soal
                </label>
                <input
                  type="number"
                  min={0}
                  value={minWords}
                  onChange={(e) => setMinWords(Number(e.target.value))}
                  placeholder="0 jika tidak ada batasan"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsExamModalOpen(false)}
                  disabled={savingExam}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingExam}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs"
                >
                  {savingExam ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Penugasan</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: TAMBAH / EDIT SOAL DENGAN SWITCH UPLOAD FILE                       */}
      {/* ========================================================================= */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h2 className="text-lg font-bold text-slate-900">
              {editingQuestion ? "Edit Butir Soal" : "Tambah Butir Soal"} &mdash; {selectedExamForQuestion?.title}
            </h2>

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Pertanyaan Essay <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="Tuliskan pertanyaan penugasan atau instruksi soal..."
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="w-full p-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Bobot Poin Soal <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={100}
                  value={questionPoints}
                  onChange={(e) => setQuestionPoints(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {/* SAKELAR / SWITCH UPLOAD FILE */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-slate-900 block">
                    Sakelar Lampiran / Upload File
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Aktifkan jika soal ini mengharuskan mahasiswa mengunggah diagram, sketsa, foto, atau file PDF.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowFileUpload}
                    onChange={(e) => setAllowFileUpload(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  disabled={savingQuestion}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingQuestion}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  {savingQuestion ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Butir Soal</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: EDIT MAHASISWA                                                   */}
      {/* ========================================================================= */}
      {isEditStudentModal && editingStudent && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h2 className="text-lg font-bold text-slate-900">
              Edit Data Mahasiswa
            </h2>

            <form onSubmit={handleSaveEditStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  NIM Mahasiswa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 2101001"
                  value={editStudentNim}
                  onChange={(e) => setEditStudentNim(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Lengkap Mahasiswa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ahmad Fauzi"
                  value={editStudentName}
                  onChange={(e) => setEditStudentName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditStudentModal(false)}
                  disabled={savingEditStudent}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingEditStudent}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  {savingEditStudent ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Perbarui Mahasiswa</span>
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

export default function ClassHubPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-500">
          Memuat ruang manajemen kelas...
        </div>
      }
    >
      <ClassHubContent />
    </Suspense>
  );
}
