"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  GraduationCap,
  ArrowLeft,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  FileText,
  Download,
  ArrowRight,
  User,
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { loadImageAsDataUrl } from "@/lib/pdf-helpers";

interface AvailableExam {
  examId: string;
  examTitle: string;
  durationMinutes: number;
  minWords: number;
  totalQuestions: number;
  className: string;
  classId: string;
  subjectName: string;
  subjectLevel: string | null;
  status: "belum" | "sedang_mengerjakan" | "selesai";
  sessionId?: string;
  startTime?: string | null;
  endTime?: string | null;
  scheduleState?: "open" | "upcoming" | "ended";
  scheduleMessage?: string | null;
}

function ExamRegisterContent() {
  const router = useRouter();

  // NIM lookup states
  const [nim, setNim] = useState("");
  const [checkingNim, setCheckingNim] = useState(false);
  const [studentName, setStudentName] = useState<string | null>(null);
  const [verifiedNim, setVerifiedNim] = useState<string | null>(null);
  const [isAllowed, setIsAllowed] = useState(true);
  const [disallowReason, setDisallowReason] = useState<string | null>(null);
  const [availableExams, setAvailableExams] = useState<AvailableExam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [startingSession, setStartingSession] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  // Dynamic branding
  const [instName, setInstName] = useState("IAI TABAH LAMONGAN");
  const [facName, setFacName] = useState("FTIK");
  const [instLogo, setInstLogo] = useState("/images/iai-tabah-logo.png");

  useEffect(() => {
    fetch("/api/settings/landing")
      .then((res) => res.json())
      .then((data) => {
        if (data?.setting) {
          if (data.setting.institutionName) setInstName(data.setting.institutionName);
          if (data.setting.facultyName) setFacName(data.setting.facultyName);
          if (data.setting.logoUrl) setInstLogo(data.setting.logoUrl);
        }
      })
      .catch(() => {});
  }, []);

  // Check NIM against database
  const handleCheckNim = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!nim.trim()) {
      toast.error("Silakan masukkan NIM terlebih dahulu");
      return;
    }

    try {
      setCheckingNim(true);
      setStudentName(null);
      setVerifiedNim(null);
      setIsAllowed(true);
      setDisallowReason(null);
      setAvailableExams([]);
      setSelectedExamId("");

      const res = await fetch(`/api/exam/lookup?nim=${encodeURIComponent(nim.trim())}`);
      const data = await res.json();

      if (!res.ok || !data.found) {
        toast.error(
          data.message ||
            "NIM tidak terdaftar. Pastikan dosen telah memasukkan NIM Anda ke kelas."
        );
        return;
      }

      setStudentName(data.studentName);
      setVerifiedNim(data.studentNim);

      if (data.isAllowed === false) {
        setIsAllowed(false);
        setDisallowReason(data.message || "Kehadiran kurang dari batas minimum.");
        toast.error("Status ujian Anda ditangguhkan oleh dosen.");
        return;
      }

      setIsAllowed(true);
      setAvailableExams(data.availableExams || []);

      if (data.availableExams && data.availableExams.length > 0) {
        // Auto select first available exam
        setSelectedExamId(data.availableExams[0].examId);
      }

      toast.success(`Data mahasiswa ditemukan: ${data.studentName}`);
    } catch {
      toast.error("Terjadi masalah saat memverifikasi NIM");
    } finally {
      setCheckingNim(false);
    }
  };

  const selectedExam = availableExams.find((e) => e.examId === selectedExamId);

  // Start exam session
  const handleStartExam = async () => {
    if (!studentName || !verifiedNim || !selectedExam) return;

    if (selectedExam.status === "selesai") {
      toast.info("Anda sudah menyelesaikan penugasan ini.");
      return;
    }

    if (selectedExam.scheduleState === "upcoming") {
      toast.warning(selectedExam.scheduleMessage || "Ujian belum dibuka sesuai jadwal.");
      return;
    }

    if (selectedExam.scheduleState === "ended") {
      toast.error(selectedExam.scheduleMessage || "Waktu pelaksanaan ujian telah berakhir.");
      return;
    }

    try {
      setStartingSession(true);
      const res = await fetch("/api/exam/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName,
          studentNim: verifiedNim,
          examId: selectedExam.examId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Gagal memulai sesi");
        return;
      }

      toast.success("Sesi ujian berhasil dibuka!");
      router.push(`/exam/${data.sessionId}`);
    } catch {
      toast.error("Terjadi gangguan jaringan");
    } finally {
      setStartingSession(false);
    }
  };

  // Download PDF if already submitted
  const handleDownloadExistingPDF = async (sessionId: string) => {
    if (downloadingPDF) return; // Mencegah spam klik
    setDownloadingPDF(true);
    const toastId = toast.loading("Sedang menyiapkan lembar jawaban PDF...");

    try {
      const res = await fetch(`/api/exam/${sessionId}/questions`);
      if (!res.ok) throw new Error("Gagal mengambil data jawaban");
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
        ["Nama Mahasiswa", `: ${data.studentName}`, "Judul Ujian", `: ${data.examTitle}`],
        ["NIM", `: ${data.studentNim}`, "Waktu Cetak", `: ${new Date().toLocaleString("id-ID")}`],
      ];

      autoTable(doc, {
        body: meta,
        startY: 28,
        theme: "plain",
        styles: { fontSize: 9, cellPadding: 1.5, textColor: [40, 40, 40] },
      });

      let currentY = (doc as any).lastAutoTable.finalY + 4;
      doc.setDrawColor(200, 200, 200);
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

        const cellText = `Soal No. ${idx + 1} (${q.points} Poin)\n${q.text}\n\n[JAWABAN ANDA]:\n${
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
        });

        currentY = (doc as any).lastAutoTable.finalY + 3;

        // Cetak gambar jika ada
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

      doc.save(`Lembar_Jawaban_${data.studentNim}.pdf`);
      toast.dismiss(toastId);
      toast.success("Lembar jawaban PDF berhasil diunduh");
    } catch {
      toast.dismiss(toastId);
      toast.error("Gagal mengunduh file PDF");
    } finally {
      setDownloadingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Halaman Depan</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 p-1 flex items-center justify-center shrink-0">
              <Image
                src={instLogo}
                alt={`Logo ${instName}`}
                width={32}
                height={32}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black tracking-widest text-emerald-800 uppercase block leading-none">
                {instName}
              </span>
              <span className="text-[11px] font-semibold text-slate-600 block mt-0.5 max-w-[180px] truncate">
                {facName}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="h-2 bg-emerald-700 w-full" />

          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Verifikasi Identitas Mahasiswa
                </h2>
                <p className="text-xs text-slate-500">
                  Cukup masukkan NIM Anda untuk memuat nama dan paket ujian yang ditugaskan
                </p>
              </div>
            </div>

            {/* Step 1: Input NIM */}
            <form onSubmit={handleCheckNim} className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Nomor Induk Mahasiswa (NIM) <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Masukkan NIM Anda (contoh: 2101001)"
                  value={nim}
                  onChange={(e) => setNim(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={checkingNim || !nim.trim()}
                  className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-semibold text-xs px-5 py-2.5 rounded-lg shadow-xs cursor-pointer disabled:cursor-not-allowed transition-colors"
                >
                  {checkingNim ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  <span>Cek NIM</span>
                </button>
              </div>
            </form>

            {/* Step 2: Auto-Filled Profile & Available Exams / Disallowed notice */}
            {studentName && verifiedNim && !isAllowed && (
              <div className="p-5 rounded-xl bg-rose-50 border border-rose-200 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">
                      Status Ujian Ditangguhkan
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">
                      {studentName} ({verifiedNim})
                    </h3>
                    <p className="text-xs text-rose-700 mt-1">
                      {disallowReason || "Kehadiran Anda tidak mencukupi batas minimum untuk mengikuti ujian pada kelas ini."}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-2">
                      Silakan hubungi dosen pengampu mata kuliah untuk konfirmasi presensi atau pengurusan dispensasi.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {studentName && verifiedNim && isAllowed && (
              <div className="p-5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-4 animate-in fade-in duration-200">
                {/* Profile Box */}
                <div className="flex items-start justify-between pb-3 border-b border-emerald-200/80">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                      Mahasiswa Terverifikasi
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                      {studentName}
                    </h3>
                    <p className="text-xs font-mono text-slate-600">
                      NIM: {verifiedNim}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-full border border-emerald-300 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Terdaftar di Kelas</span>
                  </span>
                </div>

                {/* Exams List */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Pilih Penugasan / Ujian yang Akan Dikerjakan:
                  </label>

                  {availableExams.length === 0 ? (
                    <div className="p-3.5 rounded-lg bg-white border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>Belum ada penugasan atau ujian yang berstatus aktif di kelas Anda.</span>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {availableExams.map((exam) => {
                        const isSelected = exam.examId === selectedExamId;
                        return (
                          <div
                            key={exam.examId}
                            onClick={() => setSelectedExamId(exam.examId)}
                            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-white border-emerald-600 shadow-sm ring-1 ring-emerald-600"
                                : "bg-white/80 border-slate-200 hover:bg-white"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wide">
                                    {exam.subjectName}
                                  </span>
                                  {exam.status === "selesai" && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                                      Sudah Selesai
                                    </span>
                                  )}
                                  {exam.status === "sedang_mengerjakan" && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                      Sedang Berjalan
                                    </span>
                                  )}
                                  {exam.scheduleState === "upcoming" && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                                      🕒 Belum Dibuka
                                    </span>
                                  )}
                                  {exam.scheduleState === "ended" && exam.status !== "selesai" && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-300">
                                      Ditutup
                                    </span>
                                  )}
                                  {exam.scheduleState === "open" && exam.startTime && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                                      🟢 Sedang Aktif
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs font-bold text-slate-900 block">
                                  {exam.examTitle}
                                </span>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                  Kelas {exam.className} &bull; {exam.totalQuestions} Soal
                                </p>
                                {exam.scheduleMessage && (
                                  <p className={`text-[10px] mt-1 font-medium ${
                                    exam.scheduleState === "upcoming" ? "text-amber-700" : exam.scheduleState === "ended" ? "text-slate-500" : "text-emerald-700"
                                  }`}>
                                    {exam.scheduleMessage}
                                  </p>
                                )}
                              </div>

                              <div className="text-right text-[11px] text-slate-500 whitespace-nowrap">
                                <span className="font-semibold text-slate-700">
                                  {exam.durationMinutes} Menit
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {selectedExam && (
                  <div className="pt-2">
                    {selectedExam.status === "selesai" ? (
                      <div className="space-y-2">
                        <div className="p-3 rounded-lg bg-emerald-100 text-emerald-900 text-xs font-medium">
                          Anda telah mengumpulkan lembar jawaban untuk penugasan ini.
                        </div>
                        {selectedExam.sessionId && (
                          <button
                            type="button"
                            onClick={() => handleDownloadExistingPDF(selectedExam.sessionId!)}
                            disabled={downloadingPDF}
                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold text-xs shadow-xs cursor-pointer transition-colors"
                          >
                            {downloadingPDF ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Menyiapkan Berkas PDF...</span>
                              </>
                            ) : (
                              <>
                                <Download className="w-4 h-4" />
                                <span>Unduh Salinan Lembar Jawaban (PDF)</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    ) : selectedExam.scheduleState === "upcoming" ? (
                      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                        <div>
                          <p className="font-bold">Ujian Belum Dibuka</p>
                          <p className="text-[11px] text-amber-700 mt-0.5">{selectedExam.scheduleMessage}</p>
                        </div>
                      </div>
                    ) : selectedExam.scheduleState === "ended" ? (
                      <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-300 text-slate-700 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-slate-500 shrink-0" />
                        <div>
                          <p className="font-bold">Waktu Ujian Telah Ditutup</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{selectedExam.scheduleMessage}</p>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleStartExam}
                        disabled={startingSession}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm shadow-md cursor-pointer transition-all active:scale-[0.99]"
                      >
                        {startingSession ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Menyiapkan Lembar Soal...</span>
                          </>
                        ) : (
                          <>
                            <span>
                              {selectedExam.status === "sedang_mengerjakan"
                                ? "Lanjutkan Pengerjaan Ujian"
                                : "Mulai Mengerjakan Ujian"}
                            </span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExamRegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">
          Memuat formulir ujian...
        </div>
      }
    >
      <ExamRegisterContent />
    </Suspense>
  );
}
