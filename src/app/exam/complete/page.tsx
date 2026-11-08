"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Home,
  ShieldCheck,
  Download,
  Loader2,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function ExamCompleteContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    if (!sessionId) {
      toast.error("ID sesi tidak ditemukan");
      return;
    }

    try {
      setDownloading(true);
      const res = await fetch(`/api/exam/${sessionId}/questions`);
      if (!res.ok) throw new Error("Gagal mengambil data lembar jawaban");
      const data = await res.json();

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      doc.setFillColor(5, 150, 105);
      doc.rect(0, 0, 210, 24, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("LEMBAR JAWABAN TUGAS / UJIAN DIGITAL", 105, 11, {
        align: "center",
      });
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("Bukti Pengumpulan Sah & Terverifikasi Sistem", 105, 17, {
        align: "center",
      });

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

      const answerRows = data.questions.map((q: any, idx: number) => {
        const fileInfo = q.answer?.fileName
          ? `\n[FILE LAMPIRAN]: ${q.answer.fileName} (${q.answer.fileUrl})`
          : "";
        return [
          `Soal No. ${idx + 1} (${q.points} Poin)\n${q.text}\n\n[JAWABAN ANDA]:\n${
            q.answer?.answer || "(Tidak ada teks jawaban)"
          }${fileInfo}`,
        ];
      });

      autoTable(doc, {
        body: answerRows,
        startY: currentY,
        theme: "grid",
        styles: {
          fontSize: 9,
          cellPadding: 4,
          textColor: [30, 30, 30],
          overflow: "linebreak",
        },
      });

      doc.save(`Lembar_Jawaban_${data.studentNim}.pdf`);
      toast.success("Salinan lembar jawaban PDF berhasil diunduh!");
    } catch {
      toast.error("Gagal mengunduh berkas PDF");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Jawaban Telah Dikumpulkan
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Terima kasih! Lembar jawaban dan file lampiran Anda telah berhasil tersimpan secara permanen pada sistem.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs text-slate-600">
          <div className="flex items-center gap-2 font-semibold text-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Status Pengumpulan: Sah & Terverifikasi</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-normal">
            Waktu pengumpulan otomatis tercatat di sistem. Anda dapat mengunduh arsip PDF sebagai bukti pengerjaan.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          {sessionId && (
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-semibold text-sm shadow-xs transition-colors cursor-pointer"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyiapkan PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Unduh Lembar Jawaban Saya (PDF)</span>
                </>
              )}
            </button>
          )}

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Kembali ke Halaman Utama</span>
          </Link>
        </div>
      </div>

      <p className="text-center text-xs text-slate-400 mt-6">
        Sistem Evaluasi Digital Akademik &copy; 2026
      </p>
    </div>
  );
}

export default function ExamCompletePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">
          Memuat halaman konfirmasi...
        </div>
      }
    >
      <ExamCompleteContent />
    </Suspense>
  );
}
