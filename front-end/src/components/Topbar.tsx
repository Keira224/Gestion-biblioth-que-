"use client";

import { ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";

import { useAuth } from "@/components/AuthProvider";
import { getPageTitle } from "@/lib/navigation";

export function Topbar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <header className="flex items-center justify-between rounded-2xl bg-white px-6 py-4 shadow-card">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">{getPageTitle(pathname)}</h1>
        <p className="text-sm text-slate-500">Bienvenue sur votre espace de gestion</p>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-white">
          {user?.username?.slice(0, 1).toUpperCase() ?? "U"}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">{user?.username ?? "Utilisateur"}</p>
          <p className="text-xs text-slate-500">{user?.role ?? "ROLE"}</p>
        </div>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </div>
    </header>
  );
}
