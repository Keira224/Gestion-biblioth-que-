"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">Erreur</p>
      <h1 className="text-2xl font-semibold text-slate-800">Une erreur est survenue</h1>
      <p className="max-w-md text-sm text-slate-600">
        Une erreur inattendue a empêché l’affichage de cette page. Vous pouvez réessayer.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
      >
        Réessayer
      </button>
    </main>
  );
}