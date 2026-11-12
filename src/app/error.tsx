"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application Root Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 border border-amber-200">
        <AlertCircle className="w-7 h-7" />
      </div>
      <h1 className="text-xl font-bold text-slate-900 mb-1">
        Sistem Sedang Memuat Ulang
      </h1>
      <p className="text-xs text-slate-500 max-w-md mb-6">
        Terjadi kendala sementara pada koneksi atau tampilan. Silakan klik tombol di bawah untuk menyegarkan tampilan.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Muat Ulang</span>
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-white text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Halaman Utama</span>
        </Link>
      </div>
    </div>
  );
}
