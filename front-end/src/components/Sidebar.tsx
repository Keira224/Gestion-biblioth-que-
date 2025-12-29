"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { clearTokens } from "@/lib/auth";
import { menuByRole } from "@/lib/navigation";
import { useAuth } from "@/components/AuthProvider";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const items = user ? menuByRole[user.role] : [];

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-[260px] flex-col bg-gradient-to-b from-brand-700 via-brand-800 to-brand-900 text-white shadow-xl">
      <div className="px-6 pb-8 pt-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-lg font-semibold">
            GB
          </div>
          <div>
            <p className="text-lg font-semibold">Gestion Bibliothèque</p>
            <p className="text-xs text-blue-100">Plateforme de suivi &amp; opérations</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-4">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                isActive ? "bg-white/20" : "hover:bg-white/10"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 pb-6">
        <button
          type="button"
          onClick={() => {
            clearTokens();
            router.replace("/login");
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
