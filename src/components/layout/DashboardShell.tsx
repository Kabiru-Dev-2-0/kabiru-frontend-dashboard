"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import { AuthProvider, useAuth } from "@/hooks/useAuth";

function DashboardShellContent({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F0F1F3]/40 p-6">
        <div className="flex flex-col items-center gap-3 rounded-xl border border-[#E8E8E8] bg-white px-8 py-6 text-center shadow-xs">
          <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-[#E9F2F9] border-t-[#277BC0]" />
          <p className="text-sm font-semibold text-[#11181C]">Memverifikasi sesi Dashboard Kabiru...</p>
          <p className="text-xs text-[#606876]">Mengecek hak akses Guru / Developer / Admin melalui BFF Proxy</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F0F1F3]/40 p-6">
        <div className="flex max-w-md flex-col items-center gap-3 rounded-xl border border-[#E8E8E8] bg-white px-8 py-6 text-center">
          <p className="text-sm font-semibold text-[#11181C]">Sesi tidak aktif — mengalihkan ke halaman Login...</p>
          <Link href="/login" className="text-xs font-semibold text-[#277BC0] underline">
            Klik di sini jika tidak dialihkan otomatis
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F1F3]/40">
      <Sidebar onLogout={logout} />

      <div className="ml-[306px] min-h-screen">
        <div className="fixed left-[306px] right-0 top-0 z-40">
          <TopBar name={user.fullName} role={user.role} />
        </div>

        <main className="mt-[72px] h-full overflow-y-auto p-10">
          {user.isSimulated && (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#B57E00]/40 bg-[#FFF7E6] px-4 py-3 text-xs text-[#7D5700]">
              <div className="flex items-center gap-2.5">
                <ShieldAlert size={18} className="shrink-0 text-[#B57E00]" aria-hidden="true" />
                <span>
                  <strong>Mode Simulasi Offline ({user.role.toUpperCase()}):</strong> Anda sedang meninjau UI tanpa koneksi ke API Gateway backend (
                  <code>localhost:3000/v1</code>). Perubahan tidak tersimpan ke database.
                </span>
              </div>
              <button
                type="button"
                onClick={logout}
                className="cursor-pointer rounded-md border border-[#B57E00]/40 bg-white px-2.5 py-1 font-semibold text-[#7D5700] transition-colors hover:bg-[#FFF0CC]"
              >
                Keluar Simulasi
              </button>
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider requireAuth={true}>
      <DashboardShellContent>{children}</DashboardShellContent>
    </AuthProvider>
  );
}
