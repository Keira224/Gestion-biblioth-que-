"use client";

import { useEffect, useState } from "react";
import { api } from "../../../../lib/api";
import { RoleGuard } from "../../../../components/RoleGuard";
import { TableCard } from "../../../../components/TableCard";

export default function AdminStatistiquesPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get("/api/dashboard/stats/");
        setStats(response.data);
      } catch (err: any) {
        setError(err?.response?.data?.detail || "Impossible de charger les statistiques.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <RoleGuard allowed={["ADMIN"]}>
      <div className="space-y-6">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <TableCard title="Lecteurs les plus actifs">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-slate-400">
                <tr>
                  <th className="py-2">Lecteur</th>
                  <th className="py-2">Emprunts</th>
                </tr>
              </thead>
              <tbody>
                {(stats?.lecteurs_plus_actifs || []).map((item: any, idx: number) => (
                  <tr key={`${item.adherent__user__username}-${idx}`} className="border-t border-slate-100">
                    <td className="py-3 text-slate-700">{item.adherent__user__username}</td>
                    <td className="py-3 text-slate-600">{item.total}</td>
                  </tr>
                ))}
                {!loading && (!stats?.lecteurs_plus_actifs || stats.lecteurs_plus_actifs.length === 0) && (
                  <tr>
                    <td colSpan={2} className="py-6 text-center text-sm text-slate-400">
                      Aucun lecteur à afficher.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </TableCard>

          <TableCard title="Ouvrages les plus empruntés">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-slate-400">
                <tr>
                  <th className="py-2">Ouvrage</th>
                  <th className="py-2">Emprunts</th>
                </tr>
              </thead>
              <tbody>
                {(stats?.ouvrages_plus_empruntes || []).map((item: any, idx: number) => (
                  <tr key={`${item.exemplaire__ouvrage__titre}-${idx}`} className="border-t border-slate-100">
                    <td className="py-3 text-slate-700">{item.exemplaire__ouvrage__titre}</td>
                    <td className="py-3 text-slate-600">{item.total}</td>
                  </tr>
                ))}
                {!loading && (!stats?.ouvrages_plus_empruntes || stats.ouvrages_plus_empruntes.length === 0) && (
                  <tr>
                    <td colSpan={2} className="py-6 text-center text-sm text-slate-400">
                      Aucun ouvrage à afficher.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </TableCard>
        </div>
      </div>
    </RoleGuard>
  );
}
