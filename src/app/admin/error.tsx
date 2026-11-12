"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin Page Error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4 border border-red-200">
        <AlertCircle className="w-7 h-7" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-1">
        Terjadi Kendala Memuat Halaman
      </h2>
      <p className="text-xs text-slate-500 max-w-md mb-6">
        Sistem mendeteksi adanya kendala saat memuat data. Anda dapat mencoba memuat ulang halaman ini atau kembali ke daftar kelas.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Muat Ulang Halaman</span>
        </button>
        <Link
          href="/admin/classes"
          className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
        >
          Kembali ke Kelas
        </Link>
      </div>
    </div>
  );
}
