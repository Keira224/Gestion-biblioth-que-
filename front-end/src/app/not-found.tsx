"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">404</p>
      <h1 className="text-2xl font-semibold text-slate-800">Page introuvable</h1>
      <p className="max-w-md text-sm text-slate-600">
        La page demandée n’existe pas ou a été déplacée. Vérifiez l’adresse ou revenez au tableau de bord.
      </p>
      <Link
        href="/login"
        className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
      >
        Retour à la connexion
      </Link>
    </main>
  );
}