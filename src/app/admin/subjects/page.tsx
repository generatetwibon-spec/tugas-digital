"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function SubjectsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/classes");
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-700 mb-3" />
      <p className="text-sm font-semibold text-slate-700">Mengalihkan ke Manajemen Kelas...</p>
      <p className="text-xs text-slate-400 mt-1">Struktur telah disempurnakan menjadi berbasis Kelas.</p>
    </div>
  );
}
