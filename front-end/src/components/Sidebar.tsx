"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { menuByRole } from "../lib/navigation";
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

      <nav className="flex-1 space-y-1 px-4">
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
      </nav>

      <div className="px-6 pb-6 pt-4">
        <button
          type="button"
          onClick={onLogout}
           className="flex w-full items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/20"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
      </div>
      </aside>
    </>
  );
};
