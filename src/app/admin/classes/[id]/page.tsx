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
  BookOpen,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { loadImageAsDataUrl } from "@/lib/pdf-helpers";

interface StudentRow {
  id: string;
  nim: string;
  name: string;
  isAllowed: boolean;
  allowExamReason: string | null;
  createdAt: string;
  examsStatus: {
    examId: string;
    examTitle: string;
    subjectName?: string | null;
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
  subjectName: string | null;
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
  level: string | null;
  description: string | null;
  subject?: {
    id: string;
    name: string;
    level: string | null;
  } | null;
}

function ClassHubContent() {
  const params = useParams();
  const classId = (params?.id as string) || "";
  const router = useRouter();

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
  const [examSubjectName, setExamSubjectName] = useState("");
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
  const [viewingQuestionsExamId, setViewingQuestionsExamId] = useState<string | null>(null);
  const [downloadingSessionId, setDownloadingSessionId] = useState<string | null>(null);

  // Student Filter & Search
  const [studentFilter, setStudentFilter] = useState<"all" | "allowed" | "disallowed">("all");
  const [studentSearch, setStudentSearch] = useState("");

  // Subject Management
  const [customSubjects, setCustomSubjects] = useState<string[]>([]);
  const [isAddSubjectModal, setIsAddSubjectModal] = useState(false);
  const [newSubjectInput, setNewSubjectInput] = useState("");

  // Fetch Class Metadata, Students, and Exams in ONE parallel sweep
  const loadClassData = useCallback(async (isInitial = false) => {
    if (!classId) return;

    try {
      if (isInitial) setLoading(true);

      const [resClass, resStudents, resExams] = await Promise.all([
        fetch(`/api/admin/classes/${classId}`),
        fetch(`/api/admin/classes/${classId}/students`),
        fetch(`/api/admin/exams?classId=${classId}`),
      ]);

      if (resClass.ok) {
        const classData = await resClass.json();
        setClassMeta({
          id: classData.id,
          name: classData.name,
          level: classData.level || classData.subject?.level || null,
          description: classData.description || null,
          subject: classData.subject || null,
        });
      } else if (resClass.status === 401) {
        router.push("/admin/login");
        return;
      }

      if (resStudents.ok) {
        const studentsData = await resStudents.json();
        const studentList = Array.isArray(studentsData)
          ? studentsData
          : Array.isArray(studentsData.students)
          ? studentsData.students
          : [];
        setStudents(studentList);
      } else {
        setStudents([]);
      }

      if (resExams.ok) {
        const examsData = await resExams.json();
        const examList = Array.isArray(examsData)
          ? examsData
          : Array.isArray(examsData.exams)
          ? examsData.exams
          : [];
        setExams(examList);
        if (examList.length > 0) {
          setActiveExamId((prev) => prev || examList[0].id);
        }
      } else {
        setExams([]);
      }
    } catch {
      toast.error("Gagal memuat data kelas");
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [classId, router]);

  useEffect(() => {
    if (classId) {
      loadClassData(true);
    }
  }, [classId, loadClassData]);

  // Handle Add Student
  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingStudent(true);

      if (inputMode === "single") {
        if (!singleNim.trim() || !singleName.trim()) {
          toast.error("NIM dan Nama mahasiswa wajib diisi");
          return;
        }

        const res = await fetch(`/api/admin/classes/${classId}/students`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            students: [{ nim: singleNim.trim(), name: singleName.trim() }],
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal menambahkan mahasiswa");

        toast.success(`Mahasiswa ${singleName} berhasil ditambahkan`);
        setSingleNim("");
        setSingleName("");
      } else {
        if (!bulkText.trim()) {
          toast.error("Silakan tempel data mahasiswa terlebih dahulu");
          return;
        }

        const lines = bulkText.split("\n");
        const parsedList: { nim: string; name: string }[] = [];

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          const parts = trimmed.split(/[\t,;]+/);
          if (parts.length >= 2) {
            const nimPart = parts[0].trim();
            const namePart = parts.slice(1).join(" ").trim();
            if (nimPart && namePart) {
              parsedList.push({ nim: nimPart, name: namePart });
            }
          } else {
            const spaceParts = trimmed.split(/\s+/);
            if (spaceParts.length >= 2) {
              const nimCandidate = spaceParts[0].trim();
              const nameCandidate = spaceParts.slice(1).join(" ").trim();
              if (/^\d+$/.test(nimCandidate)) {
                parsedList.push({ nim: nimCandidate, name: nameCandidate });
              }
            }
          }
        }

        if (parsedList.length === 0) {
          toast.error("Format data tidak terbaca. Pastikan format: NIM [Tab/Koma] Nama");
          return;
        }

        const res = await fetch(`/api/admin/classes/${classId}/students`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ students: parsedList }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal mengimpor mahasiswa");

        toast.success(`Berhasil menambahkan ${data.count || parsedList.length} mahasiswa`);
        setBulkText("");
      }

      setIsAddStudentModal(false);
      loadClassData(false);
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan");
    } finally {
      setSavingStudent(false);
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
      loadClassData(false);
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
      loadClassData(false);
    } catch (err: any) {
      toast.error(err.message || "Gagal mereset sesi ujian");
    }
  };

  // Toggle Student Exam Eligibility (Kehadiran / Presensi)
  const handleToggleStudentEligibility = async (student: StudentRow) => {
    const nextAllowed = !student.isAllowed;
    // Optimistic update
    setStudents((prev) =>
      prev.map((s) => (s.id === student.id ? { ...s, isAllowed: nextAllowed } : s))
    );

    try {
      const res = await fetch(`/api/admin/classes/${classId}/students`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student.id,
          isAllowed: nextAllowed,
          reason: nextAllowed ? null : "Kehadiran kurang dari batas minimum",
        }),
      });

      if (!res.ok) throw new Error("Gagal mengubah izin ujian");
      toast.success(
        nextAllowed
          ? `Mahasiswa ${student.name} sekarang DIIZINKAN mengikuti ujian`
          : `Izin ujian mahasiswa ${student.name} DITANGGUHKAN (kehadiran kurang)`
      );
    } catch {
      setStudents((prev) =>
        prev.map((s) => (s.id === student.id ? { ...s, isAllowed: student.isAllowed } : s))
      );
      toast.error("Gagal mengubah izin ujian");
    }
  };

  // Add Subject to Class
  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectInput.trim()) {
      toast.error("Nama mata kuliah wajib diisi");
      return;
    }
    const subjectName = newSubjectInput.trim();
    if (!customSubjects.includes(subjectName)) {
      setCustomSubjects((prev) => [...prev, subjectName]);
    }
    setNewSubjectInput("");
    setIsAddSubjectModal(false);
    toast.success(`Mata kuliah "${subjectName}" siap ditambahkan tugas.`);

    // Langsung buka modal buat tugas pertama untuk matkul ini
    setEditingExam(null);
    setExamSubjectName(subjectName);
    setExamTitle("");
    setDurationMinutes(90);
    setMinWords(0);
    setIsExamModalOpen(true);
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
      loadClassData(false);
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
          subjectName: examSubjectName.trim() || undefined,
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
      loadClassData(false);
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan");
    } finally {
      setSavingExam(false);
    }
  };

  // Toggle Exam Active Status
  const handleToggleExamStatus = async (exam: ExamItem) => {
    const nextStatus = !exam.isActive;
    setExams((prev) =>
      prev.map((e) => (e.id === exam.id ? { ...e, isActive: nextStatus } : e))
    );

    try {
      const res = await fetch(`/api/admin/exams/${exam.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengubah status ujian");

      toast.success(
        nextStatus
          ? `Penugasan "${exam.title}" sekarang BISA dikerjakan mahasiswa`
          : `Penugasan "${exam.title}" sekarang DITUTUP`
      );
    } catch (err: any) {
      setExams((prev) =>
        prev.map((e) => (e.id === exam.id ? { ...e, isActive: !nextStatus } : e))
      );
      toast.error(err.message || "Gagal mengubah status");
    }
  };

  // Open Question Modal
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

  // Handle Save Question
  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExamForQuestion || !questionText.trim()) {
      toast.error("Teks butir soal wajib diisi");
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
            allowFileUpload,
            fileRequired: false,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal mengupdate soal");
        toast.success("Soal berhasil diperbarui");
      } else {
        const res = await fetch("/api/admin/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            examId: selectedExamForQuestion.id,
            text: questionText.trim(),
            points: Number(questionPoints),
            allowFileUpload,
            fileRequired: false,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal menambahkan soal");
        toast.success("Butir soal berhasil ditambahkan");
      }

      setIsQuestionModalOpen(false);
      loadClassData(false);
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan");
    } finally {
      setSavingQuestion(false);
    }
  };

  // Delete Question
  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("Hapus butir soal ini?")) return;

    setExams((prev) =>
      prev.map((e) =>
        e.id === activeExamId
          ? {
              ...e,
              questions: e.questions
                .filter((q) => q.id !== questionId)
                .map((q, idx) => ({ ...q, order: idx + 1 })),
            }
          : e
      )
    );

    try {
      const res = await fetch(`/api/admin/questions/${questionId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Gagal menghapus soal");
      toast.success("Soal berhasil dihapus");
    } catch {
      toast.error("Gagal menghapus soal");
      loadClassData(false);
    }
  };

  // Reorder Question
  const handleReorderQuestion = async (
    exam: ExamItem,
    currentIndex: number,
    direction: "up" | "down"
  ) => {
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= exam.questions.length) return;

    const newQuestions = [...exam.questions];
    const [moved] = newQuestions.splice(currentIndex, 1);
    newQuestions.splice(targetIndex, 0, moved);

    const reorderedPayload = newQuestions.map((q, idx) => ({
      id: q.id,
      order: idx + 1,
    }));

    setExams((prev) =>
      prev.map((e) =>
        e.id === exam.id
          ? {
              ...e,
              questions: newQuestions.map((q, idx) => ({ ...q, order: idx + 1 })),
            }
          : e
      )
    );

    try {
      const res = await fetch("/api/admin/questions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reorderedQuestions: reorderedPayload }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan urutan");
    } catch {
      toast.error("Gagal mengubah urutan");
      loadClassData(false);
    }
  };

  // Download PDF from student row
  const handleDownloadStudentPDF = async (sessionId: string) => {
    if (downloadingSessionId) return;
    setDownloadingSessionId(sessionId);
    const toastId = toast.loading("Sedang menyiapkan lembar jawaban PDF...");

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
        ["Nama Mahasiswa", `: ${data.studentName}`, "Mata Kuliah", `: ${data.subjectName || classMeta?.name}`],
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

      for (let idx = 0; idx < data.questions.length; idx++) {
        const q = data.questions[idx];

        if (currentY > 230) {
          doc.addPage();
          currentY = 20;
        }

        const isImg =
          q.answer?.fileUrl &&
          /\.(png|jpe?g|webp)$/i.test(q.answer.fileUrl.split("?")[0]);

        const fileNote = q.answer?.fileName
          ? isImg
            ? `\n\n[FILE LAMPIRAN TERVERIFIKASI]: ${q.answer.fileName} (Gambar dicetak di bawah)`
            : `\n\n[FILE LAMPIRAN]: ${q.answer.fileName}\nTautan: ${q.answer.fileUrl}`
          : "";

        const cellText = `Soal No. ${idx + 1} (${q.points} Poin)\n${q.text}\n\n[JAWABAN]:\n${
          q.answer?.answer || "(Tidak ada teks jawaban)"
        }${fileNote}`;

        autoTable(doc, {
          body: [[cellText]],
          startY: currentY,
          theme: "grid",
          styles: {
            fontSize: 9,
            cellPadding: 4,
            textColor: [30, 30, 30],
            overflow: "linebreak",
          },
          headStyles: {
            fillColor: [240, 245, 240],
          },
        });

        currentY = (doc as any).lastAutoTable.finalY + 3;

        if (isImg && q.answer?.fileUrl) {
          const loadedImg = await loadImageAsDataUrl(q.answer.fileUrl);
          if (loadedImg) {
            const pdfW = Math.min(130, Math.max(70, (loadedImg.width * 25.4) / 150));
            const pdfH = (loadedImg.height / loadedImg.width) * pdfW;

            if (currentY + pdfH > 275) {
              doc.addPage();
              currentY = 20;
            }

            doc.setFontSize(8);
            doc.setTextColor(5, 150, 105);
            doc.text(
              `Pratinjau Gambar Lampiran Soal No. ${idx + 1} (${q.answer.fileName}):`,
              14,
              currentY + 2
            );
            currentY += 4;

            doc.addImage(
              loadedImg.dataUrl,
              loadedImg.format,
              14,
              currentY,
              pdfW,
              pdfH
            );
            currentY += pdfH + 6;
          }
        } else {
          currentY += 2;
        }
      }

      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Dokumen resmi Sistem Ujian Digital • Halaman ${i} dari ${pageCount}`,
          105,
          290,
          { align: "center" }
        );
      }

      doc.save(`Jawaban_${data.studentNim}_${data.studentName.replace(/\s+/g, "_")}.pdf`);
      toast.dismiss(toastId);
      toast.success("Lembar jawaban PDF berhasil diunduh");
    } catch {
      toast.dismiss(toastId);
      toast.error("Gagal mengunduh file PDF");
    } finally {
      setDownloadingSessionId(null);
    }
  };

  const activeExam = exams.find((e) => e.id === activeExamId);

  // Filter and stats for students
  const allowedCount = students.filter((s) => s.isAllowed !== false).length;
  const disallowedCount = students.filter((s) => s.isAllowed === false).length;

  const filteredStudents = students.filter((s) => {
    if (studentFilter === "allowed" && s.isAllowed === false) return false;
    if (studentFilter === "disallowed" && s.isAllowed !== false) return false;
    if (studentSearch.trim()) {
      const q = studentSearch.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.nim.toLowerCase().includes(q);
    }
    return true;
  });

  // Extract all subjects in this class
  const existingSubjectNames = Array.from(
    new Set(exams.map((e) => e.subjectName?.trim()).filter(Boolean) as string[])
  );
  const allSubjectNames = Array.from(
    new Set([...customSubjects, ...existingSubjectNames])
  );
  const hasExamsWithoutSubject = exams.some((e) => !e.subjectName?.trim());
  if (hasExamsWithoutSubject && !allSubjectNames.includes("Mata Kuliah Utama")) {
    allSubjectNames.push("Mata Kuliah Utama");
  }
  if (allSubjectNames.length === 0 && exams.length === 0) {
    allSubjectNames.push("Mata Kuliah Utama");
  }

  // Active exam for question editing
  const questionStudioExam = exams.find((e) => e.id === viewingQuestionsExamId);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
        <Link href="/admin/classes" className="hover:text-emerald-800 font-medium">
          Kelas & Penugasan
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">
          Kelas {classMeta?.name || "..."}
        </span>
      </div>

      {/* Class Meta Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Manajemen Kelas {classMeta?.name}
            </h1>
            {classMeta?.level && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                {classMeta.level}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Total {students.length} Mahasiswa Terdaftar ({allowedCount} Boleh Ujian, {disallowedCount} Ditangguhkan) &bull; {exams.length} Penugasan
          </p>
        </div>

        {/* Tab Switcher Buttons */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 shrink-0">
          <button
            onClick={() => {
              setActiveTab("students");
              setViewingQuestionsExamId(null);
            }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "students"
                ? "bg-white text-emerald-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Data Mahasiswa ({students.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("assignments")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "assignments"
                ? "bg-white text-emerald-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Mata Kuliah & Ujian ({exams.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: DATA MAHASISWA */}
      {activeTab === "students" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-slate-900 text-base">
                Daftar Mahasiswa Kelas {classMeta?.name}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Kelola mahasiswa di kelas ini dan tentukan status izin mengikuti ujian (misal: jika kehadiran kurang).
              </p>
            </div>

            <button
              onClick={() => {
                setInputMode("single");
                setIsAddStudentModal(true);
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Mahasiswa</span>
            </button>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setStudentFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  studentFilter === "all"
                    ? "bg-emerald-800 text-white"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                Semua ({students.length})
              </button>
              <button
                onClick={() => setStudentFilter("allowed")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  studentFilter === "allowed"
                    ? "bg-emerald-800 text-white"
                    : "bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-50"
                }`}
              >
                ✓ Boleh Ujian ({allowedCount})
              </button>
              <button
                onClick={() => setStudentFilter("disallowed")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  studentFilter === "disallowed"
                    ? "bg-rose-700 text-white"
                    : "bg-white text-rose-700 border border-rose-300 hover:bg-rose-50"
                }`}
              >
                ✕ Ditangguhkan ({disallowedCount})
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari NIM atau Nama..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 w-full sm:w-60"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-800 mb-2" />
              <p className="text-xs text-slate-500">Memuat data mahasiswa...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-700">
                {students.length === 0
                  ? "Belum Ada Mahasiswa Terdaftar"
                  : "Tidak ada mahasiswa yang sesuai dengan filter pencarian"}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {students.length === 0
                  ? "Klik tombol di atas untuk menambah mahasiswa satu per satu atau tempel (bulk paste) dari Excel."
                  : "Ubah kata kunci pencarian atau filter status di atas."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4 w-12 text-center">No</th>
                    <th className="py-3.5 px-4">NIM</th>
                    <th className="py-3.5 px-4">Nama Lengkap</th>
                    <th className="py-3.5 px-4 text-center">Izin Ujian (Presensi)</th>
                    <th className="py-3.5 px-4">Status Mata Kuliah & Ujian</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredStudents.map((student, idx) => (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 text-center font-mono text-slate-400 text-xs">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {student.nim}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {student.name}
                      </td>
                      {/* Interactive Exam Eligibility Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStudentEligibility(student)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer border shadow-2xs ${
                            student.isAllowed !== false
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300"
                              : "bg-rose-50 text-rose-700 border-rose-300 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300"
                          }`}
                          title={
                            student.isAllowed !== false
                              ? "Klik untuk menangguhkan izin mahasiswa (misal: kehadiran kurang)"
                              : "Klik untuk mengizinkan mahasiswa mengikuti ujian"
                          }
                        >
                          {student.isAllowed !== false ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Boleh Ujian</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>Ditangguhkan</span>
                            </>
                          )}
                        </button>
                        {student.isAllowed === false && (
                          <span className="block text-[10px] text-rose-600 mt-0.5 italic">
                            (Kehadiran kurang)
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {!student.examsStatus || student.examsStatus.length === 0 ? (
                          <span className="text-xs text-slate-400 italic">
                            Belum ada penugasan di kelas ini
                          </span>
                        ) : (
                          <div className="space-y-1.5">
                            {student.examsStatus.map((st) => (
                              <div
                                key={st.examId}
                                className="flex items-center gap-2 text-xs flex-wrap"
                              >
                                <span className="font-medium text-slate-700">
                                  {st.subjectName ? `${st.subjectName} — ` : ""}
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
                                          disabled={downloadingSessionId !== null}
                                          className="text-[10px] font-semibold text-emerald-800 hover:text-emerald-950 disabled:text-slate-400 underline cursor-pointer disabled:cursor-not-allowed inline-flex items-center gap-1"
                                        >
                                          {downloadingSessionId === st.sessionId && (
                                            <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                          )}
                                          <span>
                                            {downloadingSessionId === st.sessionId
                                              ? "Menyiapkan..."
                                              : "Unduh PDF"}
                                          </span>
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
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                    <Clock className="w-3 h-3 text-amber-600" />
                                    <span>Sedang Mengerjakan</span>
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                    Belum Mulai
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditStudent(student)}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
                          title="Edit Data Mahasiswa"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm(`Hapus mahasiswa ${student.name} (${student.nim}) dari kelas ini?`)) return;
                            try {
                              const res = await fetch(`/api/admin/classes/${classId}/students?studentId=${student.id}`, {
                                method: "DELETE",
                              });
                              if (!res.ok) throw new Error("Gagal menghapus mahasiswa");
                              toast.success("Mahasiswa berhasil dihapus");
                              loadClassData(false);
                            } catch {
                              toast.error("Gagal menghapus mahasiswa");
                            }
                          }}
                          className="p-1 rounded text-slate-400 hover:text-red-600 cursor-pointer"
                          title="Hapus Mahasiswa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MATA KULIAH & UJIAN */}
      {activeTab === "assignments" && (
        <div className="space-y-6">
          {/* JIKA SEDANG MEMBUKA KELOLA SOAL UJIAN TERTENTU (QUESTION STUDIO) */}
          {questionStudioExam ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6 animate-in fade-in duration-150">
              {/* Top Bar Question Studio */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div className="space-y-1">
                  <button
                    onClick={() => setViewingQuestionsExamId(null)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 mb-2 cursor-pointer transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali ke Daftar Mata Kuliah</span>
                  </button>
                  <div className="flex items-center gap-2 flex-wrap">
                    {questionStudioExam.subjectName && (
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wide">
                        {questionStudioExam.subjectName}
                      </span>
                    )}
                    <h3 className="text-xl font-bold text-slate-900">
                      {questionStudioExam.title} &mdash; Soal ({questionStudioExam.questions.length})
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        questionStudioExam.isActive
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {questionStudioExam.isActive ? "Bisa Dikerjakan" : "Non-Aktif / Ditutup"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Total Poin: {questionStudioExam.questions.reduce((a, b) => a + b.points, 0)} Poin &bull; Durasi: {questionStudioExam.durationMinutes} Menit &bull; Min Kata: {questionStudioExam.minWords > 0 ? `${questionStudioExam.minWords} kata` : "Bebas"}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleOpenAddQuestion(questionStudioExam)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Butir Soal</span>
                  </button>
                </div>
              </div>

              {/* Questions List */}
              {questionStudioExam.questions.length === 0 ? (
                <div className="py-16 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-300">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-800">Belum Ada Butir Soal</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    Klik tombol "Tambah Butir Soal" di atas untuk menambahkan butir soal essay. Anda juga dapat mengaktifkan saklar upload file/diagram jika soal membutuhkan gambar jawaban.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {questionStudioExam.questions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="p-5 rounded-xl border border-slate-200 bg-white hover:border-emerald-600/40 shadow-2xs transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                    >
                      <div className="space-y-2.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="w-6 h-6 rounded-md bg-emerald-800 text-white text-xs font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
                            Bobot: {q.points} Poin
                          </span>
                          {q.allowFileUpload ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                              <Upload className="w-3 h-3 text-purple-600" />
                              <span>Upload Diagram / File Diaktifkan</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                              Teks Essay Murni
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                          {q.text}
                        </p>
                      </div>

                      {/* Action Controls */}
                      <div className="flex items-center gap-1 shrink-0 self-end sm:self-start bg-slate-50 p-1 rounded-lg border border-slate-200">
                        <button
                          onClick={() => handleReorderQuestion(questionStudioExam, idx, "up")}
                          disabled={idx === 0}
                          className="p-1.5 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                          title="Pindah ke Atas"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleReorderQuestion(questionStudioExam, idx, "down")}
                          disabled={idx === questionStudioExam.questions.length - 1}
                          className="p-1.5 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                          title="Pindah ke Bawah"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditQuestion(questionStudioExam, q)}
                          className="p-1.5 rounded text-slate-400 hover:text-emerald-700 cursor-pointer ml-1"
                          title="Edit Soal"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-1.5 rounded text-slate-400 hover:text-red-600 cursor-pointer"
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
            /* JIKA TAMPILAN UTAMA TAB 2: KARTU MATA KULIAH DENGAN PENUGASAN DI DALAMNYA */
            <div className="space-y-6">
              {/* Header Tab 2 */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-bold text-slate-900 text-base">
                    Mata Kuliah & Penugasan (Kelas {classMeta?.name})
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Setiap mata kuliah memiliki kotak kartu tersendiri untuk mengelompokkan tugas, kuis, atau ujian.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      setNewSubjectInput("");
                      setIsAddSubjectModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-emerald-700 text-emerald-800 hover:bg-emerald-50 text-xs font-bold shadow-2xs cursor-pointer transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Tambah Mata Kuliah</span>
                  </button>

                  <button
                    onClick={() => {
                      setEditingExam(null);
                      setExamSubjectName(allSubjectNames[0] || "");
                      setExamTitle("");
                      setDurationMinutes(90);
                      setMinWords(0);
                      setIsExamModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Buat Ujian Baru</span>
                  </button>
                </div>
              </div>

              {/* LIST OF MATA KULIAH CARDS */}
              <div className="space-y-6">
                {allSubjectNames.map((subjectName) => {
                  const subjectExams = exams.filter(
                    (e) => (e.subjectName?.trim() || "Mata Kuliah Utama") === subjectName
                  );

                  return (
                    <div
                      key={subjectName}
                      className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
                    >
                      {/* Subject Card Header */}
                      <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                            <BookOpen className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-bold text-slate-900">
                                {subjectName}
                              </h3>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-slate-700 border border-slate-200 shadow-2xs">
                                {subjectExams.length} Penugasan
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500">
                              Mata kuliah pada Kelas {classMeta?.name}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setEditingExam(null);
                            setExamSubjectName(subjectName);
                            setExamTitle("");
                            setDurationMinutes(90);
                            setMinWords(0);
                            setIsExamModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs cursor-pointer transition-colors self-start sm:self-auto"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Tambah Tugas di Matkul Ini</span>
                        </button>
                      </div>

                      {/* Subject Tasks / Exams Grid */}
                      <div className="p-6">
                        {subjectExams.length === 0 ? (
                          <div className="p-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <p className="text-xs font-semibold text-slate-700">
                              Belum Ada Tugas / Ujian di Mata Kuliah Ini
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5 mb-3">
                              Tambahkan tugas mandiri, kuis, UTS, atau UAS untuk mahasiswa kelas {classMeta?.name}.
                            </p>
                            <button
                              onClick={() => {
                                setEditingExam(null);
                                setExamSubjectName(subjectName);
                                setExamTitle("");
                                setDurationMinutes(90);
                                setMinWords(0);
                                setIsExamModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Buat Tugas Pertama Sekarang</span>
                            </button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {subjectExams.map((exam) => (
                              <div
                                key={exam.id}
                                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
                              >
                                <div>
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <h4 className="font-bold text-sm text-slate-900 leading-snug">
                                        {exam.title}
                                      </h4>
                                      <p className="text-xs text-slate-500 mt-1">
                                        Durasi: {exam.durationMinutes} Menit &bull; {exam.questions.length} Butir Soal
                                      </p>
                                    </div>

                                    {/* Active Toggle Switch Button */}
                                    <button
                                      onClick={() => handleToggleExamStatus(exam)}
                                      className={`text-[10px] font-bold px-2.5 py-1 rounded-md transition-colors cursor-pointer shrink-0 border ${
                                        exam.isActive
                                          ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                                          : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                                      }`}
                                      title="Klik untuk membuka / menutup akses pengerjaan"
                                    >
                                      {exam.isActive ? "BUKA (Aktif)" : "TUTUP"}
                                    </button>
                                  </div>

                                  <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-2">
                                    <span>
                                      Total Poin: {exam.questions.reduce((a, b) => a + b.points, 0)} Poin
                                    </span>
                                    <span>&bull;</span>
                                    <span>
                                      Min Kata: {exam.minWords > 0 ? `${exam.minWords} kata` : "Bebas"}
                                    </span>
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                                  <button
                                    onClick={() => setViewingQuestionsExamId(exam.id)}
                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 cursor-pointer"
                                  >
                                    <FileText className="w-3.5 h-3.5 text-emerald-700" />
                                    <span>Kelola Butir Soal ({exam.questions.length}) &rarr;</span>
                                  </button>

                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => {
                                        setEditingExam(exam);
                                        setExamSubjectName(exam.subjectName || subjectName);
                                        setExamTitle(exam.title);
                                        setDurationMinutes(exam.durationMinutes);
                                        setMinWords(exam.minWords);
                                        setIsExamModalOpen(true);
                                      }}
                                      className="text-slate-600 hover:text-slate-900 text-xs font-semibold cursor-pointer"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteExam(exam)}
                                      className="text-red-600 hover:text-red-800 text-xs font-semibold cursor-pointer"
                                    >
                                      Hapus
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: TAMBAH MAHASISWA */}
      {isAddStudentModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Tambah Mahasiswa &mdash; Kelas {classMeta?.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Mahasiswa yang didaftarkan di kelas ini otomatis dapat mengerjakan semua penugasan di kelas ini.
              </p>
            </div>

            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <button
                type="button"
                onClick={() => setInputMode("single")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  inputMode === "single"
                    ? "bg-emerald-800 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Input Satu per Satu
              </button>
              <button
                type="button"
                onClick={() => setInputMode("bulk")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  inputMode === "bulk"
                    ? "bg-emerald-800 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Paste dari Excel (Bulk)
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-4">
              {inputMode === "single" ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      NIM Mahasiswa <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={singleNim}
                      onChange={(e) => setSingleNim(e.target.value)}
                      placeholder="Contoh: 202401001"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nama Lengkap Mahasiswa <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={singleName}
                      onChange={(e) => setSingleName(e.target.value)}
                      placeholder="Contoh: Muhammad Zaki"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Tempel Data Mahasiswa dari Excel / SIAKAD
                  </label>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Copy kolom <strong>NIM</strong> dan <strong>Nama</strong> dari Excel, lalu tempel (paste) langsung ke dalam kotak di bawah:
                  </p>
                  <textarea
                    rows={8}
                    required
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    placeholder="202401001    Ahmad Fauzi&#10;202401002    Budi Santoso&#10;202401003    Citra Lestari"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddStudentModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingStudent}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  {savingStudent && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Simpan Data Mahasiswa</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT MAHASISWA */}
      {isEditStudentModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div>
              <h3 className="text-base font-bold text-slate-900">Edit Data Mahasiswa</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Perbarui NIM atau perbaiki penulisan nama mahasiswa ini.
              </p>
            </div>

            <form onSubmit={handleSaveEditStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  NIM Mahasiswa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editStudentNim}
                  onChange={(e) => setEditStudentNim(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap Mahasiswa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editStudentName}
                  onChange={(e) => setEditStudentName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditStudentModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingEditStudent}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  {savingEditStudent && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH / EDIT PAKET UJIAN & MATKUL */}
      {isExamModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {editingExam ? "Edit Mata Kuliah / Ujian" : "Buat Mata Kuliah / Ujian Baru"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tentukan nama mata kuliah dan judul penugasan untuk Kelas {classMeta?.name}.
              </p>
            </div>

            <form onSubmit={handleSaveExam} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Mata Kuliah
                </label>
                <input
                  type="text"
                  value={examSubjectName}
                  onChange={(e) => setExamSubjectName(e.target.value)}
                  placeholder="Contoh: Manajemen Lembaga Pendidikan Islam (MLPI)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Judul Ujian / Penugasan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  placeholder="Contoh: UTS 2026, Tugas 1, UAS"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Durasi (Menit) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Min Kata (0 = Bebas)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={minWords}
                    onChange={(e) => setMinWords(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsExamModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingExam}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  {savingExam && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingExam ? "Simpan Perubahan" : "Buat Paket Ujian"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH / EDIT BUTIR SOAL */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {editingQuestion ? "Edit Butir Soal" : "Tambah Butir Soal Baru"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Paket: {selectedExamForQuestion?.title} ({classMeta?.name})
              </p>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pertanyaan / Instruksi Soal Essay <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Tuliskan butir soal essay di sini..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bobot Poin
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={questionPoints}
                  onChange={(e) => setQuestionPoints(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
                />
              </div>

              {/* SAKELAR FITUR UPLOAD FILE / DIAGRAM */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                    <Upload className="w-3.5 h-3.5 text-purple-700" />
                    <span>Izinkan Mahasiswa Unggah Diagram / File</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Nyalakan opsi ini jika soal ini meminta mahasiswa menyertakan diagram teknis, sketsa, flowchart, atau foto berkas tugas.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={allowFileUpload}
                    onChange={(e) => setAllowFileUpload(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingQuestion}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  {savingQuestion && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingQuestion ? "Simpan Perubahan" : "Tambahkan Soal"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH MATA KULIAH BARU */}
      {isAddSubjectModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Tambah Mata Kuliah Baru
                </h3>
              </div>
              <button
                onClick={() => setIsAddSubjectModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddSubject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Mata Kuliah <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Metodologi Penelitian Pendidikan"
                  value={newSubjectInput}
                  onChange={(e) => setNewSubjectInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
                />
                <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                  Kartu mata kuliah ini akan dibuat di dalam Kelas {classMeta?.name}. Anda langsung dapat menambahkan paket tugas/ujian di dalamnya.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddSubjectModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
                >
                  Buat Mata Kuliah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ClassDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-800 mb-2" />
          <p className="text-xs text-slate-500">Memuat halaman kelas...</p>
        </div>
      }
    >
      <ClassHubContent />
    </Suspense>
  );
}
