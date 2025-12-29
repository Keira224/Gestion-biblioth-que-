"use client";

import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";

import { StatCard } from "@/components/StatCard";
import { TableCard } from "@/components/TableCard";
import { api } from "@/lib/api";
import { useRoleGuard } from "@/lib/guard";

export default function AdminStatistiquesPage() {
  useRoleGuard(["ADMIN"]);
  const [stats, setStats] = useState<{
    resume: { nb_emprunts_total: number; nb_emprunts_en_retard: number; nb_penalites_impayees: number };
    lecteurs_plus_actifs: { adherent__user__username: string; total: number }[];
    ouvrages_plus_empruntes: { exemplaire__ouvrage__titre: string; total: number }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/api/dashboard/stats/");
      setStats(data);
    } catch {
      setError("Impossible de charger les statistiques.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      {error ? <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</div> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Emprunts totaux"
          value={stats?.resume.nb_emprunts_total ?? "-"}
          icon={BarChart3}
          tone="blue"
        />
        <StatCard
          label="Emprunts en retard"
          value={stats?.resume.nb_emprunts_en_retard ?? "-"}
          icon={BarChart3}
          tone="amber"
        />
        <StatCard
          label="Pénalités impayées"
          value={stats?.resume.nb_penalites_impayees ?? "-"}
          icon={BarChart3}
          tone="rose"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TableCard title="Lecteurs les plus actifs">
          {loading ? (
            <p className="text-sm text-slate-500">Chargement...</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-slate-400">
                  <th className="py-2">Lecteur</th>
                  <th>Total emprunts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats?.lecteurs_plus_actifs.map((item) => (
                  <tr key={item.adherent__user__username} className="text-slate-600">
                    <td className="py-3 font-medium text-slate-700">{item.adherent__user__username}</td>
                    <td>{item.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </TableCard>
        <TableCard title="Ouvrages les plus empruntés">
          {loading ? (
            <p className="text-sm text-slate-500">Chargement...</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-slate-400">
                  <th className="py-2">Ouvrage</th>
                  <th>Total emprunts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats?.ouvrages_plus_empruntes.map((item) => (
                  <tr key={item.exemplaire__ouvrage__titre} className="text-slate-600">
                    <td className="py-3 font-medium text-slate-700">{item.exemplaire__ouvrage__titre}</td>
                    <td>{item.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </TableCard>
      </div>
    </div>
  );
}
