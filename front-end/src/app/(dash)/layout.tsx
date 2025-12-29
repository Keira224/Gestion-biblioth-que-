"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AuthProvider, useAuth } from "../../components/AuthProvider";
import { Sidebar } from "../../components/Sidebar";
import { Topbar } from "../../components/Topbar";
import { getPageTitle } from "../../lib/navigation";

const Shell = ({ children }: { children: ReactNode }) => {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/login";
    }
  }, [loading, user]);

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
      <Sidebar role={user.role} onLogout={logout} />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar title={getPageTitle(pathname)} user={user} />
        <main className="flex-1 bg-slate-100 px-8 py-6">{children}</main>
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
