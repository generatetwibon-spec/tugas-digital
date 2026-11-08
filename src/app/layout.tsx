import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Sistem Ujian Digital",
  description: "Sistem Ujian Tengah Semester Online",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="light" style={{ colorScheme: "light" }}>
      <body className="font-sans antialiased bg-gray-50 text-gray-900">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
