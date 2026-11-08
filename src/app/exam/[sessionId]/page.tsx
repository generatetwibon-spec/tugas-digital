"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Clock,
  Send,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  FileText,
  Upload,
  Image as ImageIcon,
  FileCheck,
  X,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { useExamSecurity } from "@/hooks/useExamSecurity";

interface QuestionItem {
  id: string;
  text: string;
  order: number;
  points: number;
  allowFileUpload: boolean;
  fileRequired: boolean;
  answer: {
    id: string;
    answer: string;
    wordCount: number;
    fileUrl?: string | null;
    fileName?: string | null;
  } | null;
}

interface ExamData {
  examTitle: string;
  durationMinutes: number;
  minWords: number;
  startedAt: string;
  studentName: string;
  studentNim: string;
  questions: QuestionItem[];
}

function ExamSessionContent() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  // Security layer (anti copy, anti paste, anti devtools shortcut)
  useExamSecurity();

  // Data States
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Local answers cache: { [questionId]: string }
  const [answers, setAnswers] = useState<Record<string, string>>({});
  // Local files cache: { [questionId]: { url: string; name: string } }
  const [attachedFiles, setAttachedFiles] = useState<
    Record<string, { url: string; name: string }>
  >({});
  const [uploadingFile, setUploadingFile] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");

  // Resilience: Online / Offline tracking
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [unsavedQueue, setUnsavedQueue] = useState<Record<string, string>>({});

  // Timer state
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timeUpSubmitting, setTimeUpSubmitting] = useState(false);

  // Submit Modal & Double Click Blocker
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  // Debounce save ref
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate word count
  const countWords = (text: string) => {
    if (!text || !text.trim()) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  // Submit function (Resilient against double clicks)
  const handleSubmitExam = useCallback(
    async (isAuto = false) => {
      if (isSubmittingRef.current || submitting || timeUpSubmitting) return;
      isSubmittingRef.current = true;

      if (isAuto) {
        setTimeUpSubmitting(true);
        toast.info("Waktu ujian telah habis! Mengumpulkan lembar jawaban...");
      } else {
        setSubmitting(true);
      }

      try {
        const res = await fetch(`/api/exam/${sessionId}/submit`, {
          method: "POST",
        });

        if (res.ok) {
          // Bersihkan backup offline jika submit sukses
          try {
            if (typeof window !== "undefined") {
              localStorage.removeItem(`exam_draft_${sessionId}`);
            }
          } catch {}

          toast.success("Ujian berhasil dikumpulkan!");
          router.replace(`/exam/complete?sessionId=${sessionId}`);
        } else {
          const data = await res.json();
          toast.error(data.error || "Gagal mengumpulkan ujian");
          isSubmittingRef.current = false;
          setSubmitting(false);
          setTimeUpSubmitting(false);
        }
      } catch {
        toast.error("Terjadi masalah jaringan saat submit. Silakan klik submit kembali.");
        isSubmittingRef.current = false;
        setSubmitting(false);
        setTimeUpSubmitting(false);
      }
    },
    [sessionId, router, submitting, timeUpSubmitting]
  );

  // Load Exam and Questions
  useEffect(() => {
    async function loadExam() {
      try {
        setLoading(true);
        const res = await fetch(`/api/exam/${sessionId}/questions`);
        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || "Gagal memuat ujian");
          if (res.status === 400 && data.error?.includes("dikumpulkan")) {
            router.replace(`/exam/complete?sessionId=${sessionId}`);
          }
          return;
        }

        setExamData(data);

        // Pre-populate answers & files dictionary
        const initialAnswers: Record<string, string> = {};
        const initialFiles: Record<string, { url: string; name: string }> = {};

        data.questions.forEach((q: QuestionItem) => {
          initialAnswers[q.id] = q.answer?.answer || "";
          if (q.answer?.fileUrl) {
            initialFiles[q.id] = {
              url: q.answer.fileUrl,
              name: q.answer.fileName || "File Terlampir",
            };
          }
        });

        // Cek cadangan offline di localStorage (jika laptop sempat mati mendadak / browser crash)
        let recoveredCount = 0;
        try {
          if (typeof window !== "undefined") {
            const localBackupStr = localStorage.getItem(`exam_draft_${sessionId}`);
            if (localBackupStr) {
              const localBackup = JSON.parse(localBackupStr);
              Object.keys(localBackup).forEach((qId) => {
                const localText = localBackup[qId] || "";
                const serverText = initialAnswers[qId] || "";
                if (localText && localText.length > serverText.length) {
                  initialAnswers[qId] = localText;
                  recoveredCount++;
                }
              });
            }
          }
        } catch (storageErr) {
          console.warn("Error membaca backup lokal:", storageErr);
        }

        setAnswers(initialAnswers);
        setAttachedFiles(initialFiles);

        if (recoveredCount > 0) {
          toast.info("Ditemukan draf jawaban lokal di laptop Anda. Jawaban berhasil dipulihkan!");
        }

        // Compute initial remaining time
        const startTime = new Date(data.startedAt).getTime();
        const durationMs = data.durationMinutes * 60 * 1000;
        const endTime = startTime + durationMs;
        const remainingSec = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
        setTimeLeft(remainingSec);
      } catch {
        toast.error("Gagal terhubung ke server ujian");
      } finally {
        setLoading(false);
      }
    }

    if (sessionId) {
      loadExam();
    }
  }, [sessionId, router]);

  // Save current answer to server (Resilient against dropped connection)
  const saveAnswerToServer = useCallback(
    async (questionId: string, answerText: string) => {
      // Selalu simpan instan ke localStorage laptop lebih dulu (aman dari laptop mati mendadak)
      try {
        if (typeof window !== "undefined") {
          const current = localStorage.getItem(`exam_draft_${sessionId}`);
          const parsed = current ? JSON.parse(current) : {};
          parsed[questionId] = answerText;
          localStorage.setItem(`exam_draft_${sessionId}`, JSON.stringify(parsed));
        }
      } catch {}

      // Jika koneksi sedang terputus, masukkan antrean retry
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        setSaveStatus("unsaved");
        setUnsavedQueue((prev) => ({ ...prev, [questionId]: answerText }));
        return;
      }

      try {
        setSaveStatus("saving");
        const res = await fetch(`/api/exam/${sessionId}/answer`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionId,
            answer: answerText,
          }),
        });

        if (res.ok) {
          setSaveStatus("saved");
          setUnsavedQueue((prev) => {
            const next = { ...prev };
            delete next[questionId];
            return next;
          });
        } else {
          setSaveStatus("unsaved");
          setUnsavedQueue((prev) => ({ ...prev, [questionId]: answerText }));
        }
      } catch {
        setSaveStatus("unsaved");
        setUnsavedQueue((prev) => ({ ...prev, [questionId]: answerText }));
      }
    },
    [sessionId]
  );

  // Network Listener (Resilience against slow/dropped network)
  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Koneksi internet kembali aktif! Menyinkronkan jawaban...");
      // Auto-flush jawaban yang tertunda
      setUnsavedQueue((prevQueue) => {
        const entries = Object.entries(prevQueue);
        if (entries.length > 0) {
          entries.forEach(([qId, txt]) => {
            saveAnswerToServer(qId, txt);
          });
        }
        return {};
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSaveStatus("unsaved");
      toast.warning(
        "Koneksi internet terputus. Jawaban Anda tetap tersimpan aman di laptop ini."
      );
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [saveAnswerToServer]);

  // Timer Tick
  useEffect(() => {
    if (timeLeft === null) return;

    if (timeLeft <= 0) {
      handleSubmitExam(true);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          handleSubmitExam(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, handleSubmitExam]);

  // Handle typing with debounced save & instant local storage backup
  const handleAnswerChange = (text: string) => {
    if (!currentQuestion) return;

    const qId = currentQuestion.id;
    setAnswers((prev) => {
      const updated = { ...prev, [qId]: text };
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem(`exam_draft_${sessionId}`, JSON.stringify(updated));
        }
      } catch {}
      return updated;
    });
    setSaveStatus("saving");

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveAnswerToServer(qId, text);
    }, 1000);
  };

  // Handle File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentQuestion) return;

    try {
      setUploadingFile(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("questionId", currentQuestion.id);

      const res = await fetch(`/api/exam/${sessionId}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengunggah file");

      setAttachedFiles((prev) => ({
        ...prev,
        [currentQuestion.id]: { url: data.fileUrl, name: data.fileName },
      }));

      toast.success("File berhasil diunggah dan terlampir");
    } catch (err: any) {
      toast.error(err.message || "Gagal mengunggah file");
    } finally {
      setUploadingFile(false);
    }
  };

  // Format Timer Display
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-700 mb-3" />
        <p className="text-sm font-medium text-slate-600">
          Menyiapkan ruang ujian...
        </p>
      </div>
    );
  }

  if (!examData || examData.questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-w-md w-full text-center">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-800">Soal Ujian Belum Tersedia</h2>
          <p className="text-sm text-slate-500 mt-1">
            Dosen belum mengunggah butir soal untuk penugasan ini atau sesi tidak valid.
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm font-medium hover:bg-emerald-800"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = examData.questions[currentIndex];
  const currentAnswer = answers[currentQuestion.id] || "";
  const currentFile = attachedFiles[currentQuestion.id];
  const currentWords = countWords(currentAnswer);
  const minWords = examData.minWords;
  const isWordMet = minWords === 0 || currentWords >= minWords;

  // Calculate statistics for navigator
  const answeredCount = examData.questions.filter((q) => {
    const ans = answers[q.id];
    const file = attachedFiles[q.id];
    return (ans && ans.trim().length > 0) || Boolean(file);
  }).length;
  const totalQuestions = examData.questions.length;

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col exam-secure select-none relative overflow-x-hidden">
      {/* Background Watermark */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.035] flex flex-wrap content-start select-none overflow-hidden"
        style={{ transform: "rotate(-25deg) scale(1.3)" }}
      >
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} className="text-sm font-mono whitespace-nowrap p-10 font-bold">
            {examData.studentName} &bull; {examData.studentNim}
          </div>
        ))}
      </div>

      {/* Offline Alert Bar */}
      {!isOnline && (
        <div className="bg-amber-600 text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-between sticky top-0 z-30 shadow-md">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 animate-bounce" />
            <span>
              Koneksi internet terputus. Jawaban Anda tetap tersimpan aman di browser laptop ini. Jangan panik atau menutup halaman!
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined" && navigator.onLine) {
                window.dispatchEvent(new Event("online"));
              } else {
                toast.info("Masih belum terhubung ke internet");
              }
            }}
            className="underline text-amber-100 hover:text-white cursor-pointer ml-3 font-bold"
          >
            Coba Sinkronkan
          </button>
        </div>
      )}

      {/* Top Navbar Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="hidden sm:flex w-9 h-9 rounded-lg bg-emerald-700 text-white items-center justify-center font-bold text-sm">
              UTS
            </div>
            <div className="truncate">
              <h1 className="text-sm font-bold text-slate-900 truncate">
                {examData.examTitle}
              </h1>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">
                  {examData.studentName}
                </span>
                <span>&bull;</span>
                <span>NIM: {examData.studentNim}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Save Status Indicator */}
            <div className="hidden md:flex items-center gap-1.5 text-xs mr-2">
              {!isOnline ? (
                <div className="flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Offline (Tersimpan Lokal)</span>
                </div>
              ) : saveStatus === "saving" ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                  <span className="text-amber-600">Menyimpan...</span>
                </>
              ) : saveStatus === "unsaved" ? (
                <div className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  <span>Menunggu Sinkron...</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-slate-500">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tersimpan</span>
                </div>
              )}
            </div>

            {/* Countdown Clock */}
            {timeLeft !== null && (
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono font-bold text-sm ${
                  timeLeft < 300
                    ? "bg-red-50 border-red-200 text-red-700 animate-pulse"
                    : "bg-slate-50 border-slate-200 text-slate-800"
                }`}
              >
                <Clock className="w-4 h-4 text-emerald-700" />
                <span>{formatTime(timeLeft)}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={() => setShowSubmitModal(true)}
              className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs sm:text-sm px-3.5 py-2 rounded-lg shadow-xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kumpulkan Jawaban</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 relative z-10">
        <div className="lg:col-span-3 flex flex-col space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-5">
            {/* Question Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 font-bold text-xs">
                  Soal Nomor {currentIndex + 1}
                </span>
                <span className="text-xs text-slate-500">
                  dari {totalQuestions} Soal
                </span>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                Bobot: {currentQuestion.points} Poin
              </span>
            </div>

            {/* Question Text */}
            <div className="text-slate-800 text-base sm:text-lg font-medium leading-relaxed whitespace-pre-wrap">
              {currentQuestion.text}
            </div>

            {/* Essay Answer Area */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Lembar Jawaban Essay</span>
                </label>
                <div
                  className={`text-xs font-medium px-2 py-0.5 rounded ${
                    isWordMet
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {minWords > 0 ? (
                    <span>
                      {currentWords} / minimal {minWords} kata{" "}
                      {isWordMet ? "✓" : `(kurang ${minWords - currentWords})`}
                    </span>
                  ) : (
                    <span>{currentWords} kata</span>
                  )}
                </div>
              </div>

              <textarea
                rows={10}
                value={currentAnswer}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="Tuliskan jawaban lengkap Anda di sini... (Ketik secara mandiri, copy-paste dinonaktifkan demi integritas ujian)"
                className="w-full p-4 rounded-xl border border-slate-300 text-slate-900 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all resize-y font-sans placeholder-slate-400"
                spellCheck={false}
              />
            </div>

            {/* SWITCH UPLOAD FILE: HANYA MUNCUL JIKA DOSEN MENGAKTIFKAN PADA SOAL INI */}
            {currentQuestion.allowFileUpload && (
              <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4 text-purple-700" />
                    <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                      Lampiran Diagram / Foto / Dokumen Pendukung
                    </span>
                  </div>
                  <span className="text-[11px] text-purple-700 font-medium">
                    Mendukung JPG, PNG, WEBP, PDF (Maks 10MB)
                  </span>
                </div>

                {currentFile ? (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-purple-200">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-semibold text-slate-800">
                        {currentFile.name}
                      </span>
                    </div>

                    <a
                      href={currentFile.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 hover:text-purple-900"
                    >
                      <span>Lihat Lampiran</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ) : (
                  <div>
                    <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-purple-300 rounded-xl bg-white hover:bg-purple-50/50 cursor-pointer transition-colors">
                      {uploadingFile ? (
                        <div className="flex items-center gap-2 text-xs font-medium text-purple-700">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Mengunggah file lampiran...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-center">
                          <ImageIcon className="w-6 h-6 text-purple-500 mb-1" />
                          <span className="text-xs font-bold text-purple-900">
                            Klik untuk Mengunggah Diagram / Gambar / File PDF
                          </span>
                          <span className="text-[11px] text-slate-500">
                            File akan otomatis disimpan dan terlampir pada lembar jawaban Anda
                          </span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleFileUpload}
                        disabled={uploadingFile}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs sm:text-sm font-medium transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>

              <button
                disabled={currentIndex === totalQuestions - 1}
                onClick={() =>
                  setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))
                }
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white disabled:opacity-40 disabled:cursor-not-allowed text-xs sm:text-sm font-semibold transition-colors"
              >
                <span>Selanjutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Question Navigator */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4 sticky top-22">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Navigasi Soal</h3>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {answeredCount} / {totalQuestions} Terisi
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {examData.questions.map((q, idx) => {
                const ans = answers[q.id];
                const file = attachedFiles[q.id];
                const isAnswered = (ans && ans.trim().length > 0) || Boolean(file);
                const isCurrent = idx === currentIndex;

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-10 rounded-lg text-xs font-bold transition-all flex items-center justify-center relative cursor-pointer ${
                      isCurrent ? "ring-2 ring-emerald-700 ring-offset-2" : ""
                    } ${
                      isAnswered
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-emerald-600 inline-block" />
                <span>Sudah dijawab / file terlampir</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-slate-100 border border-slate-300 inline-block" />
                <span>Belum dijawab</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-white ring-2 ring-emerald-700 inline-block" />
                <span>Soal aktif</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Confirmation Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-bold text-slate-900 text-base">
              Konfirmasi Pengumpulan Jawaban
            </h3>
            <p className="text-xs text-slate-500">
              Pastikan semua butir soal telah Anda periksa dengan seksama.
            </p>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Total Soal:</span>
                <span className="font-bold text-slate-900">{totalQuestions} Butir</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Soal Sudah Dijawab / Terlampir:</span>
                <span className="font-bold text-emerald-700">{answeredCount} Butir</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Setelah dikumpulkan, sesi pengerjaan Anda akan selesai dan Anda dapat langsung mengunduh salinan lembar jawaban dalam format PDF.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                disabled={submitting}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
              >
                Kembali Periksa
              </button>
              <button
                type="button"
                onClick={() => handleSubmitExam(false)}
                disabled={submitting}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs cursor-pointer disabled:bg-slate-300"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Mengirimkan...</span>
                  </>
                ) : (
                  <span>Ya, Kumpulkan Sekarang</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExamSessionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-medium">
          Menyiapkan ruang ujian...
        </div>
      }
    >
      <ExamSessionContent />
    </Suspense>
  );
}
