"use client";

import { useState } from "react";
import { api } from "../../../lib/api";
import { defaultRouteForRole } from "../../../lib/guard";
import { setTokens, storeUser } from "../../../lib/auth";
import type { UserProfile } from "../../../lib/auth";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const tokenResponse = await api.post("/api/auth/token/", {
        username,
        password,
      });
      setTokens(tokenResponse.data.access, tokenResponse.data.refresh);
      const userResponse = await api.get<UserProfile>("/api/auth/me/");
      storeUser(userResponse.data);
      window.location.href = defaultRouteForRole(userResponse.data.role);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(detail || "Identifiants invalides. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
        <div className="bg-sidebar-gradient flex flex-col justify-center px-12 py-16 text-white">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-xl font-semibold">
            GB
          </div>
          <h1 className="mt-6 text-3xl font-semibold">
            Système de Gestion de Bibliothèque
          </h1>
          <p className="mt-4 text-sm text-white/80">
            Centralisez les emprunts, pénalités et activités en un tableau de bord unique.
          </p>
        </div>

        <div className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
            <h2 className="text-2xl font-semibold text-slate-800">Connexion</h2>
            <p className="mt-2 text-sm text-slate-500">
              Accédez à votre espace selon votre rôle.
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="text-xs font-semibold text-slate-500">Identifiant</label>
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
                  placeholder="Nom d'utilisateur"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Mot de passe</label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
              >
                {loading ? "Connexion..." : "Se connecter"}
              </button>

              <button
                type="button"
                className="text-xs font-semibold text-blue-600"
              >
                Mot de passe oublié ?
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
