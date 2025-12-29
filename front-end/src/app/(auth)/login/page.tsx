"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User } from "lucide-react";

import { api } from "@/lib/api";
import { setTokens } from "@/lib/auth";
import { roleHomeMap, type UserRole } from "@/lib/navigation";

type TokenResponse = {
  access: string;
  refresh: string;
};

type MeResponse = {
  username: string;
  role: UserRole;
};

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data } = await api.post<TokenResponse>("/api/auth/token/", {
        username,
        password,
      });
      setTokens(data.access, data.refresh);
      const me = await api.get<MeResponse>("/api/auth/me/");
      router.replace(roleHomeMap[me.data.role]);
    } catch (err: unknown) {
      setError("Identifiants invalides. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 lg:flex-row">
      <div className="flex w-full flex-col justify-between bg-gradient-to-b from-brand-600 via-brand-700 to-brand-800 px-10 py-12 text-white lg:w-1/2">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-xl font-semibold">
            GB
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Système de Gestion de Bibliothèque</h1>
            <p className="text-sm text-blue-100">Optimisez le suivi, les prêts et la performance.</p>
          </div>
        </div>
        <div className="mt-16 max-w-md space-y-4 text-sm text-blue-100">
          <p>
            Centralisez vos opérations, pilotez vos activités et suivez les indicateurs clés de votre bibliothèque dans un
            espace dédié.
          </p>
          <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
            <p className="text-base font-medium text-white">Accès sécurisé par rôle</p>
            <p className="text-xs text-blue-100">Administrateur, bibliothécaire et lecteur partagent le même design.</p>
          </div>
        </div>
      </div>

      <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-card">
          <h2 className="text-2xl font-semibold text-slate-800">Connexion</h2>
          <p className="mt-2 text-sm text-slate-500">Renseignez vos identifiants pour accéder à votre espace.</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="block text-sm text-slate-600">
              Identifiant
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <User className="h-4 w-4 text-slate-400" />
                <input
                  className="w-full bg-transparent text-sm text-slate-700 outline-none"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Votre identifiant"
                  required
                />
              </div>
            </label>

            <label className="block text-sm text-slate-600">
              Mot de passe
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <Lock className="h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  className="w-full bg-transparent text-sm text-slate-700 outline-none"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Votre mot de passe"
                  required
                />
              </div>
            </label>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-70"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <button type="button" className="mt-4 text-sm text-brand-600 hover:underline">
            Mot de passe oublié ?
          </button>
        </div>
      </div>
    </div>
  );
}
