"use client";

import { useEffect, useState } from "react";
import { Calendar, ClipboardList, Wallet } from "lucide-react";
import { api } from "../../../lib/api";
import { RoleGuard } from "../../../components/RoleGuard";
import { StatCard } from "../../../components/StatCard";
import { TableCard } from "../../../components/TableCard";
import { ActivityCard } from "../../../components/ActivityCard";
import { formatDate, formatMoney } from "../../../lib/format";

export default function LecteurDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [emprunts, setEmprunts] = useState<any[]>([]);
  const [penalites, setPenalites] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [statsRes, empruntsRes, penalitesRes, activitiesRes] = await Promise.all([
          api.get("/api/dashboard/stats/"),
          api.get("/api/emprunts/recents/"),
          api.get("/api/penalites/me/"),
          api.get("/api/dashboard/activities/"),
        ]);
        setStats(statsRes.data);
        setEmprunts(empruntsRes.data.results || []);
        setPenalites(penalitesRes.data.results || []);
        setActivities(activitiesRes.data.results || []);
      } catch (err: any) {
        setError(err?.response?.data?.detail || "Impossible de charger le tableau de bord.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <RoleGuard allowed={["LECTEUR"]}>
      <div className="space-y-6">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Mes emprunts"
            value={stats?.resume?.nb_emprunts_total ?? (loading ? "..." : 0)}
            icon={<ClipboardList className="h-5 w-5" />}
          />
          <StatCard
            title="Emprunts en retard"
            value={stats?.resume?.nb_emprunts_en_retard ?? (loading ? "..." : 0)}
            icon={<Calendar className="h-5 w-5" />}
          />
          <StatCard
            title="Pénalités impayées"
            value={stats?.resume?.nb_penalites_impayees ?? (loading ? "..." : 0)}
            icon={<Wallet className="h-5 w-5" />}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
          <TableCard title="Mes emprunts récents">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-slate-400">
                <tr>
                  <th className="py-2">Ouvrage</th>
                  <th className="py-2">Statut</th>
                  <th className="py-2">Retour prévu</th>
                </tr>
              </thead>
              <tbody>
                {emprunts.map((emprunt) => (
                  <tr key={emprunt.id} className="border-t border-slate-100">
                    <td className="py-3 text-slate-700">{emprunt.ouvrage_titre}</td>
                    <td className="py-3 text-slate-600">{emprunt.statut}</td>
                    <td className="py-3 text-slate-600">{formatDate(emprunt.date_retour_prevue)}</td>
                  </tr>
                ))}
                {!loading && emprunts.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-sm text-slate-400">
                      Aucun emprunt enregistré.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </TableCard>

          <ActivityCard
            title="Dernières activités"
            items={
              activities.map((activity) => (
                <div key={activity.id} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <p className="text-sm font-medium text-slate-700">{activity.message}</p>
                  <p className="mt-1 text-xs text-slate-400">{formatDate(activity.created_at)}</p>
                </div>
              ))
            }
            fallback={!loading && activities.length === 0 ? <p className="text-sm text-slate-400">Aucune activité.</p> : null}
          />
        </div>

        <TableCard title="Mes pénalités">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-slate-400">
              <tr>
                <th className="py-2">Ouvrage</th>
                <th className="py-2">Montant</th>
                <th className="py-2">Statut</th>
              </tr>
            </thead>
            <tbody>
              {penalites.map((penalite) => (
                <tr key={penalite.id} className="border-t border-slate-100">
                  <td className="py-3 text-slate-700">{penalite.ouvrage_titre}</td>
                  <td className="py-3 text-slate-600">{formatMoney(penalite.montant)}</td>
                  <td className="py-3 text-slate-600">{penalite.payee ? "Payée" : "Impayée"}</td>
                </tr>
              ))}
              {!loading && penalites.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-sm text-slate-400">
                    Aucune pénalité.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </TableCard>
      </div>
    </RoleGuard>
  );
}
