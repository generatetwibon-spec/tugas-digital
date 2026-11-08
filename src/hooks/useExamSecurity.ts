"use client";
import { useEffect } from "react";
import { toast } from "sonner";

export function useExamSecurity() {
  useEffect(() => {
    // 1. Block copy
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      toast.warning(
        "Eits, dilarang copy teks ya! Pahami materi dan kerjakan secara mandiri 😉✍️",
        { id: "security-toast", duration: 3500 }
      );
    };

    // 2. Block paste
    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      toast.error(
        "Maaf ya! Halaman ujian ini TIDAK BISA PASTE. Ayo ketik manual sendiri, semangat ya ngetiknya! ✍️🔥",
        { id: "security-toast", duration: 4000 }
      );
    };

    // 3. Block cut
    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      toast.warning(
        "Fitur cut dinonaktifkan di sistem ujian ini ya! Jawabanmu tetap aman kok 😉",
        { id: "security-toast", duration: 3500 }
      );
    };

    // 4. Block right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      toast.info(
        "Klik kanan dinonaktifkan demi integritas ujian digital. Semangat ngetiknya ya! 🚀",
        { id: "security-toast", duration: 3500 }
      );
    };

    // 5. Block keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      // Block Ctrl+V (Paste shortcut)
      if (e.ctrlKey && key === "v") {
        e.preventDefault();
        toast.error(
          "Maaf ya! Halaman ujian ini TIDAK BISA PASTE. Ayo ketik manual sendiri, semangat ya ngetiknya! ✍️🔥",
          { id: "security-toast", duration: 4000 }
        );
        return;
      }

      // Block Ctrl+C (Copy shortcut)
      if (e.ctrlKey && key === "c") {
        e.preventDefault();
        toast.warning(
          "Eits, dilarang copy ya! Ayo pahami materi dan ketik sendiri 😉✍️",
          { id: "security-toast", duration: 3500 }
        );
        return;
      }

      // Block Ctrl+X (Cut shortcut)
      if (e.ctrlKey && key === "x") {
        e.preventDefault();
        toast.warning("Fitur cut dinonaktifkan di sistem ujian ini! 😉", {
          id: "security-toast",
        });
        return;
      }

      // Block Ctrl+U, Ctrl+S, Ctrl+P (View source, save, print)
      if (e.ctrlKey && ["u", "s", "p"].includes(key)) {
        e.preventDefault();
        toast.warning("Pintasan ini dinonaktifkan selama ujian berlangsung!", {
          id: "security-toast",
        });
        return;
      }

      // Block DevTools shortcuts (F12, Ctrl+Shift+I/J/C)
      if (
        key === "f12" ||
        (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(key))
      ) {
        e.preventDefault();
        toast.error(
          "Inspeksi / DevTools dinonaktifkan! Jangan coba-coba mengintip lewat console ya! 🕵️‍♂️❌",
          { id: "security-toast", duration: 4000 }
        );
        return;
      }

      // Block PrintScreen (Clear clipboard)
      if (e.key === "PrintScreen") {
        navigator.clipboard?.writeText("").catch(() => {});
        toast.warning(
          "Screenshot terdeteksi & clipboard dibersihkan! Kerjakan mandiri ya! 📸🚫",
          { id: "security-toast", duration: 3500 }
        );
      }
    };

    // 6. Anti-DevTools: debugger loop
    const debuggerInterval = setInterval(() => {
      const start = performance.now();
      // eslint-disable-next-line no-debugger
      debugger;
      const end = performance.now();
      if (end - start > 100) {
        console.clear();
      }
    }, 3000);

    // 7. Disable console methods in production
    if (process.env.NODE_ENV === "production") {
      const noop = () => {};
      Object.defineProperty(window, "console", {
        value: {
          log: noop,
          warn: noop,
          error: noop,
          info: noop,
          debug: noop,
          dir: noop,
          dirxml: noop,
          table: noop,
          trace: noop,
          group: noop,
          groupCollapsed: noop,
          groupEnd: noop,
          clear: noop,
          count: noop,
          countReset: noop,
          assert: noop,
          profile: noop,
          profileEnd: noop,
          time: noop,
          timeLog: noop,
          timeEnd: noop,
          timeStamp: noop,
        },
        writable: false,
        configurable: false,
      });
    }

    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("cut", handleCut);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("cut", handleCut);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      clearInterval(debuggerInterval);
    };
  }, []);
}
