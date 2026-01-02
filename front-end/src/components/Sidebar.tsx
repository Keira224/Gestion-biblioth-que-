"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { menuByRole, quickActionsByRole } from "../lib/navigation";
import type { UserRole } from "../lib/auth";

export const Sidebar = ({
  role,
  onLogout,
  isOpen,
  onClose,
}: {
  role: UserRole;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const pathname = usePathname();
  const menu = menuByRole(role);
  const quickActions = quickActionsByRole(role);

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-900/40 transition md:hidden ${isOpen ? "block" : "hidden"}`}
        onClick={onClose}
      />
      <aside
        className={`bg-sidebar-gradient fixed z-50 flex h-screen w-64 flex-col text-white shadow-xl transition md:static md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
      <div className="px-6 pb-6 pt-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-xl font-bold">
          GB
        </div>
        <h1 className="mt-4 text-lg font-semibold">Gestion Bibliothèque</h1>
        <p className="mt-2 text-xs text-white/70">
          Plateforme professionnelle de suivi des emprunts et ressources.
        </p>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-4 pb-6">
        <div className="space-y-1">
          <p className="px-2 text-xs font-semibold uppercase tracking-wide text-white/60">Navigation</p>
        {menu.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                active ? "bg-white/20 text-white" : "text-white/80 hover:bg-white/10"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
        </div>

        <div className="space-y-2 rounded-xl border border-white/10 bg-white/10 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Actions rapides</p>
          <div className="space-y-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white/90 transition hover:bg-white/20"
                >
                  <Icon className="h-4 w-4" />
                  {action.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <div className="shrink-0 px-6 pb-6 pt-4">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-2 rounded-lg border border-white/30 px-3 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
      </div>
      </aside>
    </>
  );
};
