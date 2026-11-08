"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import Sidebar from "@/components/admin/Sidebar";

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Suspense fallback={<aside className="w-64 bg-emerald-800 h-screen" />}>
        <Sidebar />
      </Suspense>
      <main className="flex-1 lg:ml-0 min-h-screen">
        <div className="p-6">
          <Suspense
            fallback={
              <div className="p-8 text-center text-slate-500">
                Memuat konten...
              </div>
            }
          >
            {children}
          </Suspense>
        </div>
      </main>
    </div>
  );
}

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <Suspense
        fallback={
          <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            Memuat...
          </div>
        }
      >
        <AdminLayoutInner>{children}</AdminLayoutInner>
      </Suspense>
    </SessionProvider>
  );
}
