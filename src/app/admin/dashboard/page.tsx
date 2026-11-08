"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import {
  BookOpen,
  Users,
  ClipboardList,
  CheckCircle2,
  GraduationCap,
  Loader2,
  Clock,
  ArrowRight,
  FolderOpen,
  FileText,
  Plus,
} from "lucide-react";

interface Stats {
  subjectCount: number;
  classCount: number;
  studentCount: number;
  activeExamCount: number;
  sessionCount: number;
  activeExams: {
    id: string;
    title: string;
    classId: string;
    subjectId: string;
    className: string;
    subjectName: string;
    sessionCount: number;
    durationMinutes: number;
  }[];
  recentSubmissions: {
    id: string;
    studentName: string;
    studentNim: string;
    examTitle: string;
    subjectName: string;
    className: string;
    submittedAt: string;
  }[];
}

function DashboardContent() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-slate-200">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-700 mb-2" />
        <p className="text-xs text-slate-500">Memuat data dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-900 rounded-2xl p-6 sm:p-8 text-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="inline-block px-2.5 py-1 rounded-md bg-white/10 text-emerald-100 text-xs font-semibold uppercase tracking-wider mb-2">
            Panel Administrator & Dosen
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Selamat Datang di Portal Ujian Digital
          </h1>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-xl">
            Kelola mata kuliah, daftarkan mahasiswa per kelas, atur soal essay dan upload file diagram, serta pantau pengerjaan secara real-time.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <Link
            href="/admin/subjects"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-emerald-900 font-bold text-xs sm:text-sm shadow-xs hover:bg-emerald-50 transition-colors"
          >
            <Plus className="w-4 h-4 text-emerald-700" />
            <span>Kelola Penugasan</span>
          </Link>
        </div>
      </div>

      {/* 5 Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="text-2xl font-black text-slate-900 block leading-tight">
            {stats?.subjectCount ?? 0}
          </span>
          <span className="text-xs text-slate-500 font-medium">Mata Kuliah</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-2xl font-black text-slate-900 block leading-tight">
            {stats?.classCount ?? 0}
          </span>
          <span className="text-xs text-slate-500 font-medium">Kelas Terdaftar</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center mb-3">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="text-2xl font-black text-slate-900 block leading-tight">
            {stats?.studentCount ?? 0}
          </span>
          <span className="text-xs text-slate-500 font-medium">Mahasiswa Terdata</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
            <ClipboardList className="w-5 h-5" />
          </div>
          <span className="text-2xl font-black text-slate-900 block leading-tight">
            {stats?.activeExamCount ?? 0}
          </span>
          <span className="text-xs text-slate-500 font-medium">Tugas / Ujian Aktif</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs col-span-2 lg:col-span-1">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <span className="text-2xl font-black text-slate-900 block leading-tight">
            {stats?.sessionCount ?? 0}
          </span>
          <span className="text-xs text-slate-500 font-medium">Jawaban Selesai</span>
        </div>
      </div>

      {/* Grid: Active Assignments & Recent Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Assignments */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-emerald-700" />
              <span>Penugasan & Ujian yang Sedang Aktif</span>
            </h2>
            <Link
              href="/admin/subjects"
              className="text-xs font-semibold text-emerald-700 hover:underline"
            >
              Lihat Semua
            </Link>
          </div>

          {!stats?.activeExams || stats.activeExams.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center italic">
              Belum ada penugasan dengan status AKTIF.
            </p>
          ) : (
            <div className="space-y-3">
              {stats.activeExams.map((e) => (
                <div
                  key={e.id}
                  className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 flex items-center justify-between gap-3"
                >
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                      {e.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {e.subjectName} &bull; Kelas {e.className} &bull; Durasi: {e.durationMinutes} Menit
                    </p>
                  </div>

                  <Link
                    href={`/admin/subjects/${e.subjectId}/classes/${e.classId}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900"
                  >
                    <span>Buka</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Submissions */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Pengumpulan Jawaban Terbaru</span>
            </h2>
            <Link
              href="/admin/answers"
              className="text-xs font-semibold text-emerald-700 hover:underline"
            >
              Lihat Lembar Jawaban
            </Link>
          </div>

          {!stats?.recentSubmissions || stats.recentSubmissions.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center italic">
              Belum ada mahasiswa yang mengumpulkan lembar jawaban.
            </p>
          ) : (
            <div className="space-y-3">
              {stats.recentSubmissions.map((s) => (
                <div
                  key={s.id}
                  className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">
                        {s.studentName}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        ({s.studentNim})
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {s.examTitle} &bull; Kelas {s.className}
                    </p>
                  </div>

                  <span className="text-[11px] text-slate-400 font-medium">
                    {new Date(s.submittedAt).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    WIB
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-500">
          Memuat dashboard...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
