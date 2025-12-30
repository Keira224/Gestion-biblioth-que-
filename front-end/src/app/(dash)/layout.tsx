"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AuthProvider, useAuth } from "../../components/AuthProvider";
import { Sidebar } from "../../components/Sidebar";
import { Topbar } from "../../components/Topbar";
import { getPageTitle } from "../../lib/navigation";

const Shell = ({ children }: { children: ReactNode }) => {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/login";
    }
  }, [loading, user]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
        Chargement du tableau de bord...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar role={user.role} onLogout={logout} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-h-screen flex-1 flex-col md:ml-0">
        <Topbar title={getPageTitle(pathname)} user={user} onMenuToggle={() => setSidebarOpen((prev) => !prev)} />
        <main className="flex-1 bg-slate-100 px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <Shell>{children}</Shell>
    </AuthProvider>
  );
}
