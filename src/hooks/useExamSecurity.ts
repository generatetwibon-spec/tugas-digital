"use client";
import { useEffect } from 'react';

export function useExamSecurity() {
  useEffect(() => {
    // 1. Block copy
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
    };

    // 2. Block paste
    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
    };

    // 3. Block cut
    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
    };

    // 4. Block right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // 5. Block keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+U, Ctrl+S, Ctrl+P
      if (e.ctrlKey && ['c', 'v', 'x', 'u', 's', 'p'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
      // Block Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (DevTools)
      if (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
      // Block F12
      if (e.key === 'F12') {
        e.preventDefault();
      }
      // Block PrintScreen - wipe clipboard
      if (e.key === 'PrintScreen') {
        navigator.clipboard.writeText('').catch(() => {});
      }
    };

    // 6. Anti-DevTools: debugger loop
    const debuggerInterval = setInterval(() => {
      const start = performance.now();
      // eslint-disable-next-line no-debugger
      debugger;
      const end = performance.now();
      // If debugger paused for more than 100ms, DevTools is likely open
      if (end - start > 100) {
        console.clear();
      }
    }, 3000);

    // 7. Disable console methods in production
    if (process.env.NODE_ENV === 'production') {
      const noop = () => {};
      Object.defineProperty(window, 'console', {
        value: {
          log: noop, warn: noop, error: noop, info: noop, debug: noop,
          dir: noop, dirxml: noop, table: noop, trace: noop, group: noop,
          groupCollapsed: noop, groupEnd: noop, clear: noop, count: noop,
          countReset: noop, assert: noop, profile: noop, profileEnd: noop,
          time: noop, timeLog: noop, timeEnd: noop, timeStamp: noop,
        },
        writable: false,
        configurable: false,
      });
    }

    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('cut', handleCut);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      clearInterval(debuggerInterval);
    };
  }, []);
}
