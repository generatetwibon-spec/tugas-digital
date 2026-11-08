"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Download,
  Eye,
  Filter,
  CheckCircle2,
  Clock,
  User,
  GraduationCap,
  Calendar,
  Loader2,
  AlertCircle,
  FileSpreadsheet,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { loadImageAsDataUrl } from "@/lib/pdf-helpers";

interface SubjectOption {
  id: string;
  name: string;
}

interface ClassOption {
  id: string;
  name: string;
  subjectId: string;
}

interface ExamOption {
  id: string;
  title: string;
  classId: string;
}

interface AnswerDetail {
  id: string;
  answer: string;
  wordCount: number;
  fileUrl?: string | null;
  fileName?: string | null;
  question: {
    id: string;
    text: string;
    order: number;
    points: number;
  };
}

interface StudentSession {
  id: string;
  studentName: string;
  studentNim: string;
  startedAt: string;
  submittedAt: string | null;
  ipAddress: string | null;
  answers: AnswerDetail[];
}

export default function AnswersReviewPage() {
  // Cascading filters
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [exams, setExams] = useState<ExamOption[]>([]);

  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedExamId, setSelectedExamId] = useState("");

  // Submissions data
  const [sessions, setSessions] = useState<StudentSession[]>([]);
  const [loading, setLoading] = useState(false);

  // Detail Modal
  const [activeSession, setActiveSession] = useState<StudentSession | null>(null);

  // Initial load: subjects
  useEffect(() => {
    async function loadSubjects() {
      try {
        const res = await fetch("/api/admin/subjects");
        if (res.ok) {
          const data = await res.json();
          setSubjects(data);
          if (data.length > 0) {
            setSelectedSubjectId(data[0].id);
          }
        }
      } catch {
        toast.error("Gagal memuat mata kuliah");
      }
    }
    loadSubjects();
  }, []);

  // When subject changes: load classes
  useEffect(() => {
    if (!selectedSubjectId) {
      setClasses([]);
      setSelectedClassId("");
      return;
    }

    async function loadClasses() {
      try {
        const res = await fetch(`/api/admin/classes?subjectId=${selectedSubjectId}`);
        if (res.ok) {
          const data = await res.json();
          setClasses(data);
          if (data.length > 0) {
            setSelectedClassId(data[0].id);
          } else {
            setSelectedClassId("");
            setExams([]);
            setSelectedExamId("");
          }
        }
      } catch {
        toast.error("Gagal memuat kelas");
      }
    }
    loadClasses();
  }, [selectedSubjectId]);

  // When class changes: load exams
  useEffect(() => {
    if (!selectedClassId) {
      setExams([]);
      setSelectedExamId("");
      return;
    }

    async function loadExams() {
      try {
        const res = await fetch(`/api/admin/exams?classId=${selectedClassId}`);
        if (res.ok) {
          const data = await res.json();
          setExams(data);
          if (data.length > 0) {
            setSelectedExamId(data[0].id);
          } else {
            setSelectedExamId("");
            setSessions([]);
          }
        }
      } catch {
        toast.error("Gagal memuat ujian");
      }
    }
    loadExams();
  }, [selectedClassId]);

  // When exam changes: load student answers
  const fetchSessions = useCallback(async () => {
    if (!selectedExamId) {
      setSessions([]);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/admin/answers?examId=${selectedExamId}`);
      if (!res.ok) throw new Error("Gagal mengambil jawaban");
      const data = await res.json();
      setSessions(data);
    } catch {
      toast.error("Gagal memuat jawaban mahasiswa");
    } finally {
      setLoading(false);
    }
  }, [selectedExamId]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Generate single student PDF
  const handleDownloadPDF = async (session: StudentSession) => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const currentSubject = subjects.find((s) => s.id === selectedSubjectId)?.name || "-";
      const currentClass = classes.find((c) => c.id === selectedClassId)?.name || "-";
      const currentExam = exams.find((e) => e.id === selectedExamId)?.title || "Ujian Tengah Semester";

      // Header Banner
      doc.setFillColor(5, 150, 105); // Emerald-600
      doc.rect(0, 0, 210, 24, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("LEMBAR JAWABAN UJIAN TENGAH SEMESTER (UTS)", 105, 11, { align: "center" });
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Sistem Evaluasi Akademik Digital Terintegrasi", 105, 17, { align: "center" });

      // Student Meta Table
      const studentMeta = [
        ["Nama Mahasiswa", `: ${session.studentName}`, "Mata Kuliah", `: ${currentSubject}`],
        ["NIM", `: ${session.studentNim}`, "Kelas", `: Kelas ${currentClass}`],
        [
          "Waktu Mulai",
          `: ${new Date(session.startedAt).toLocaleString("id-ID")}`,
          "Waktu Selesai",
          `: ${session.submittedAt ? new Date(session.submittedAt).toLocaleString("id-ID") : "Belum submit"}`,
        ],
        [
          "Status Pengerjaan",
          `: ${session.submittedAt ? "SELESAI (Dikumpulkan)" : "SEDANG BERJALAN"}`,
          "Alamat IP",
          `: ${session.ipAddress || "Lokal / Internal"}`,
        ],
      ];

      autoTable(doc, {
        body: studentMeta,
        startY: 28,
        theme: "plain",
        styles: {
          fontSize: 9,
          cellPadding: 1.5,
          textColor: [40, 40, 40],
        },
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 32 },
          1: { cellWidth: 70 },
          2: { fontStyle: "bold", cellWidth: 28 },
          3: { cellWidth: 60 },
        },
      });

      // Questions & Answers Section
      let currentY = (doc as any).lastAutoTable.finalY + 4;

      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(14, currentY, 196, currentY);
      currentY += 6;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(5, 100, 70);
      doc.text(`JAWABAN SOAL ESSAY — ${currentExam.toUpperCase()}`, 14, currentY);
      currentY += 5;

      for (let idx = 0; idx < session.answers.length; idx++) {
        const ans = session.answers[idx];

        if (currentY > 230) {
          doc.addPage();
          currentY = 20;
        }

        const isImg =
          ans.fileUrl &&
          /\.(png|jpe?g|webp)$/i.test(ans.fileUrl.split("?")[0]);

        const fileNote = ans.fileName
          ? isImg
            ? `\n\n[FILE LAMPIRAN TERVERIFIKASI]: ${ans.fileName} (Gambar dicetak di bawah)`
            : `\n\n[FILE LAMPIRAN]: ${ans.fileName}\nTautan: ${ans.fileUrl}`
          : "";

        const cellText = `Soal No. ${idx + 1} (Bobot: ${ans.question.points} Poin)\n${ans.question.text}\n\n[JAWABAN MAHASISWA] (Panjang: ${ans.wordCount} kata):\n${ans.answer || "(Mahasiswa tidak memberikan jawaban)"}${fileNote}`;

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

        // Cetak gambar jika ada
        if (isImg && ans.fileUrl) {
          const loadedImg = await loadImageAsDataUrl(ans.fileUrl);
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
              `Pratinjau Gambar Lampiran Soal No. ${idx + 1} (${ans.fileName}):`,
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

      // Footer
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

      // Save PDF
      doc.save(
        `Jawaban_UTS_${session.studentNim}_${session.studentName.replace(/\s+/g, "_")}.pdf`
      );
      toast.success(`PDF ${session.studentName} berhasil diunduh`);
    } catch (err) {
      console.error(err);
      toast.error("Gagal men-generate file PDF");
    }
  };

  // Export CSV for Google Sheets / Excel
  const handleExportCSV = () => {
    if (sessions.length === 0) {
      toast.error("Tidak ada data untuk diekspor");
      return;
    }

    const currentSubject = subjects.find((s) => s.id === selectedSubjectId)?.name || "";
    const currentClass = classes.find((c) => c.id === selectedClassId)?.name || "";

    const headers = ["Nama Mahasiswa", "NIM", "Mata Kuliah", "Kelas", "Waktu Mulai", "Waktu Selesai", "Status", "Jumlah Soal Dijawab", "Total Kata"];
    const rows = sessions.map((s) => {
      const answeredCount = s.answers.filter((a) => a.answer && a.answer.trim().length > 0).length;
      const totalWords = s.answers.reduce((acc, a) => acc + a.wordCount, 0);
      return [
        `"${s.studentName}"`,
        `"${s.studentNim}"`,
        `"${currentSubject}"`,
        `"${currentClass}"`,
        `"${new Date(s.startedAt).toLocaleString("id-ID")}"`,
        `"${s.submittedAt ? new Date(s.submittedAt).toLocaleString("id-ID") : "Belum Submit"}"`,
        `"${s.submittedAt ? "Selesai" : "Sedang Dikerjakan"}"`,
        answeredCount,
        totalWords,
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Rekap_Ujian_${currentSubject}_Kelas_${currentClass}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("File CSV rekap nilai berhasil diunduh (Bisa langsung dibuka di Excel/Google Sheets)");
  };

  // Reset / Delete Session (Testing / Retake support)
  const handleDeleteSession = async (session: StudentSession) => {
    if (
      !confirm(
        `Yakin ingin mereset/menghapus lembar jawaban mahasiswa:\n\nNama: ${session.studentName}\nNIM: ${session.studentNim}\n\nSetelah direset, seluruh jawaban akan dihapus dan mahasiswa dapat mengerjakan ujian kembali dari awal.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/answers?sessionId=${session.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mereset sesi");

      toast.success(data.message || "Sesi ujian berhasil direset");
      if (activeSession?.id === session.id) {
        setActiveSession(null);
      }
      if (selectedExamId) {
        fetchSessions();
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan saat mereset");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Lembar Jawaban Mahasiswa
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Periksa hasil ujian essay mahasiswa dan unduh berkas lembar jawaban digital (PDF & Rekap Excel/Google Sheets)
          </p>
        </div>

        {sessions.length > 0 && (
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-300 shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>Ekspor Rekap (Excel / Sheets)</span>
          </button>
        )}
      </div>

      {/* Filter Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <Filter className="w-4 h-4 text-emerald-700" />
          <span>Pilih Sesi Ujian</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Select Subject */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Mata Kuliah
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Select Class */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Kelas
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              disabled={classes.length === 0}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white disabled:bg-slate-100"
            >
              {classes.length === 0 ? (
                <option value="">Belum ada kelas</option>
              ) : (
                classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    Kelas {c.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Select Exam */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Judul Ujian
            </label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              disabled={exams.length === 0}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white disabled:bg-slate-100"
            >
              {exams.length === 0 ? (
                <option value="">Belum ada ujian dibuat</option>
              ) : (
                exams.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Submissions List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-base">
            Daftar Jawaban Mahasiswa ({sessions.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-700 mb-2" />
            <p className="text-xs text-slate-500">Memuat data jawaban...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-700">Belum Ada Jawaban Masuk</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Mahasiswa yang mengisi dan mengumpulkan ujian akan muncul di sini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Mahasiswa</th>
                  <th className="py-3.5 px-4">NIM</th>
                  <th className="py-3.5 px-4">Waktu Selesai</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Total Kata</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {sessions.map((s) => {
                  const totalWords = s.answers.reduce(
                    (acc, a) => acc + a.wordCount,
                    0
                  );
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {s.studentName}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs">{s.studentNim}</td>
                      <td className="py-3.5 px-4 text-slate-500 text-xs">
                        {s.submittedAt
                          ? new Date(s.submittedAt).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            }) + " WIB"
                          : "Belum dikumpulkan"}
                      </td>
                      <td className="py-3.5 px-4">
                        {s.submittedAt ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Selesai</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Sedang Berjalan</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium">
                        {totalWords} kata
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => setActiveSession(s)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>Periksa</span>
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(s)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </button>
                        <button
                          onClick={() => handleDeleteSession(s)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 text-xs font-semibold cursor-pointer transition-colors"
                          title="Reset / Hapus Jawaban (Izinkan Mahasiswa Mengerjakan Ulang)"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reset</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Student Answer Detail Modal */}
      {activeSession && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Lembar Jawaban: {activeSession.studentName}
                </h3>
                <p className="text-xs text-slate-500">
                  NIM: {activeSession.studentNim} &bull; Selesai:{" "}
                  {activeSession.submittedAt
                    ? new Date(activeSession.submittedAt).toLocaleString("id-ID")
                    : "Belum dikumpulkan"}
                </p>
              </div>

              <button
                onClick={() => handleDownloadPDF(activeSession)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh PDF</span>
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {activeSession.answers.map((ans, idx) => (
                <div
                  key={ans.id}
                  className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase px-2.5 py-1 rounded bg-emerald-100 text-emerald-800">
                      Soal Nomor {idx + 1} ({ans.question.points} Poin)
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      Panjang Jawaban: {ans.wordCount} Kata
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-slate-900 whitespace-pre-wrap leading-relaxed">
                    {ans.question.text}
                  </p>

                  <div className="pt-2 border-t border-slate-200/80">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Jawaban Mahasiswa:
                    </div>
                    <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed font-sans bg-white p-3.5 rounded-lg border border-slate-200">
                      {ans.answer || "(Tidak ada jawaban)"}
                    </p>

                    {ans.fileUrl && (
                      <div className="mt-2.5 p-3 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-between text-xs">
                        <span className="font-semibold text-purple-900">
                          Lampiran File: {ans.fileName || "File Terlampir"}
                        </span>
                        <a
                          href={ans.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-purple-700 hover:text-purple-900 underline"
                        >
                          Lihat / Buka File
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => handleDeleteSession(activeSession)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset / Hapus Sesi Ujian Mahasiswa</span>
              </button>
              <button
                onClick={() => setActiveSession(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
