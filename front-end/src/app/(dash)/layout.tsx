"use client";

import { AuthProvider, useAuth } from "@/components/AuthProvider";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar />
      <main className="ml-[260px] min-h-screen px-8 py-8">
        <Topbar />
        <div className="mt-6">
          {loading ? (
            <div className="rounded-2xl bg-white p-6 text-sm text-slate-500 shadow-card">
              Chargement des informations utilisateur...
            </div>
          ) : (
            children
          )}
        </div>
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardShell>{children}</DashboardShell>
    </AuthProvider>
  );
}
