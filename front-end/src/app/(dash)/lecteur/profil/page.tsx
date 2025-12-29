"use client";

import { useAuth } from "../../../../components/AuthProvider";
import { RoleGuard } from "../../../../components/RoleGuard";

export default function LecteurProfilPage() {
  const { user } = useAuth();

  return (
    <RoleGuard allowed={["LECTEUR"]}>
      <div className="max-w-2xl space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800">Mon profil</h3>
          <p className="mt-2 text-sm text-slate-500">
            Informations disponibles depuis votre compte.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase text-slate-400">Nom d'utilisateur</p>
              <p className="mt-1 text-sm font-semibold text-slate-700">{user?.username}</p>
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase text-slate-400">Rôle</p>
              <p className="mt-1 text-sm font-semibold text-slate-700">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
