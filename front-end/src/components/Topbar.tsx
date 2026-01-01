"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, ChevronDown, CircleHelp, Menu } from "lucide-react";
import { useState } from "react";
import type { UserProfile } from "../lib/auth";
import { getBreadcrumbs, getSupportLink } from "../lib/navigation";

export const Topbar = ({
  title,
  user,
  onMenuToggle,
}: {
  title: string;
  user: UserProfile;
  onMenuToggle?: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 bg-white px-6 py-4 md:flex-row md:items-center md:justify-between md:px-8">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuToggle}
          className="rounded-lg border border-slate-200 p-2 text-slate-500 md:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>
          <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
        </div>
        {breadcrumbs.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            {breadcrumbs.map((crumb, index) => (
              <div key={`${crumb.label}-${index}`} className="flex items-center gap-2">
                {crumb.href ? (
                  <Link href={crumb.href} className="font-semibold text-slate-500 hover:text-slate-700">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-semibold text-slate-700">{crumb.label}</span>
                )}
                {index < breadcrumbs.length - 1 && <ChevronRight className="h-3 w-3 text-slate-400" />}
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-slate-500">Suivi en temps réel des opérations</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={getSupportLink(user.role)}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600"
        >
          <CircleHelp className="h-4 w-4" />
          Aide & support
        </Link>
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="flex items-center gap-3 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold">
              {user.username.slice(0, 2).toUpperCase()}
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-700">{user.username}</p>
              <p className="text-[11px] uppercase text-slate-400">{user.role}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-500" />
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-lg">
              <p className="font-semibold text-slate-700">Profil</p>
              <p className="mt-1 text-xs text-slate-500">Rôle: {user.role}</p>
              <Link
                href={getSupportLink(user.role)}
                className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600"
              >
                Contacter le support
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
