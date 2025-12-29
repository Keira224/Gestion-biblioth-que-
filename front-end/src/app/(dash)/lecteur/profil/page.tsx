"use client";

import { useRoleGuard } from "@/lib/guard";
import { useAuth } from "@/components/AuthProvider";

export default function LecteurProfilPage() {
  useRoleGuard(["LECTEUR"]);
  const { user } = useAuth();

  return (
    <div className="max-w-2xl space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-card">
        <h2 className="text-lg font-semibold text-slate-800">Mon profil</h2>
        <p className="mt-1 text-sm text-slate-500">Informations liées à votre compte lecteur.</p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase text-slate-400">Nom d'utilisateur</p>
            <p className="mt-1 text-sm font-medium text-slate-700">{user?.username ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-slate-400">Rôle</p>
            <p className="mt-1 text-sm font-medium text-slate-700">{user?.role ?? "LECTEUR"}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-slate-400">Statut</p>
            <p className="mt-1 text-sm font-medium text-slate-700">Actif</p>
          </div>
          <div>
            <p className="text-xs uppercase text-slate-400">Accès</p>
            <p className="mt-1 text-sm font-medium text-slate-700">Lecture &amp; suivi personnel</p>
          </div>
        </div>
      </div>
    </div>
  );
}
