"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type { UserProfile } from "../lib/auth";

export const Topbar = ({ title, user }: { title: string; user: UserProfile }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
        <p className="text-xs text-slate-500">Suivi en temps réel des opérations</p>
      </div>
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
          <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-lg">
            <p className="font-semibold text-slate-700">Profil</p>
            <p className="mt-1 text-xs text-slate-500">Rôle: {user.role}</p>
          </div>
        )}
      </div>
    </div>
  );
};
