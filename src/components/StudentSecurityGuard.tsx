"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { ShieldAlert, RefreshCw } from "lucide-react";

export default function StudentSecurityGuard() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);

  // Check DevTools presence via viewport delta & timing
  const checkDevTools = useCallback(() => {
    if (isAdmin) return;

    // 1. Check window dimension threshold (docked DevTools)
    const widthThreshold = window.outerWidth - window.innerWidth > 160;
    const heightThreshold = window.outerHeight - window.innerHeight > 160;

    if (widthThreshold || heightThreshold) {
      setIsDevToolsOpen(true);
      return;
    }

    // 2. Timing check with debugger
    const t0 = performance.now();
    // eslint-disable-next-line no-debugger
    debugger;
    const t1 = performance.now();
    if (t1 - t0 > 100) {
      setIsDevToolsOpen(true);
      return;
    }

    setIsDevToolsOpen(false);
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) return;

    // Keyboard shortcuts prevention
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      // F12
      if (key === "f12") {
        e.preventDefault();
        e.stopPropagation();
        setIsDevToolsOpen(true);
        return false;
      }

      // Ctrl + Shift + I/J/C
      if (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(key)) {
        e.preventDefault();
        e.stopPropagation();
        setIsDevToolsOpen(true);
        return false;
      }

      // Mac Command + Option + I/J/C
      if (e.metaKey && e.altKey && ["i", "j", "c"].includes(key)) {
        e.preventDefault();
        e.stopPropagation();
        setIsDevToolsOpen(true);
        return false;
      }

      // Ctrl + U (View source)
      if (e.ctrlKey && key === "u") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl + S or Ctrl + P
      if (e.ctrlKey && (key === "s" || key === "p")) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // Right-click contextmenu prevention
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Override console output to prevent reading scripts
    if (typeof window !== "undefined") {
      const emptyFunc = () => {};
      try {
        console.log = emptyFunc;
        console.warn = emptyFunc;
        console.error = emptyFunc;
        console.info = emptyFunc;
        console.debug = emptyFunc;
        console.dir = emptyFunc;
        console.table = emptyFunc;
      } catch {
        // ignore
      }
    }

    // Initial check
    checkDevTools();

    // Listeners
    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("contextmenu", handleContextMenu, true);
    window.addEventListener("resize", checkDevTools);

    // Periodic detection loop
    const interval = setInterval(checkDevTools, 1200);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("contextmenu", handleContextMenu, true);
      window.removeEventListener("resize", checkDevTools);
      clearInterval(interval);
    };
  }, [isAdmin, checkDevTools]);

  // Don't render anything for admin routes or when DevTools is closed
  if (isAdmin || !isDevToolsOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[999999] bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none animate-in fade-in duration-200">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mb-4 shadow-lg shadow-rose-950/20">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <span className="text-[11px] font-bold uppercase tracking-widest text-rose-400 bg-rose-950/60 px-3 py-1 rounded-full border border-rose-800/50 mb-2">
        Sistem Keamanan Ujian Digital
      </span>

      <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2">
        Inspeksi / Developer Tools Terdeteksi
      </h2>

      <p className="text-xs sm:text-sm text-slate-300 max-w-md mb-6 leading-relaxed">
        Demi menjaga integritas dan kejujuran akademik, akses ke Console / Inspect Element dinonaktifkan di seluruh portal mahasiswa.
        <br />
        <br />
        <strong className="text-white font-semibold">
          Silakan tutup jendela Developer Tools / Console Anda
        </strong>{" "}
        untuk melanjutkan pengerjaan.
      </p>

      <button
        type="button"
        onClick={() => {
          checkDevTools();
          if (window.outerWidth - window.innerWidth <= 160 && window.outerHeight - window.innerHeight <= 160) {
            setIsDevToolsOpen(false);
          }
        }}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-md cursor-pointer transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Saya Sudah Menutup Developer Tools</span>
      </button>
    </div>
  );
}
