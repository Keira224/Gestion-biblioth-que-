"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Calendar, ClipboardList, Wallet } from "lucide-react";
import { api } from "../../../lib/api";
import { formatDate, formatMoney } from "../../../lib/format";
import { RoleGuard } from "../../../components/RoleGuard";
import { StatCard } from "../../../components/StatCard";
import { TableCard } from "../../../components/TableCard";
import { ActivityCard } from "../../../components/ActivityCard";

const EmptyRow = ({ colSpan }: { colSpan: number }) => (
  <tr>
    <td colSpan={colSpan} className="py-6 text-center text-sm text-slate-400">
      Aucun élément à afficher.
    </td>
  </tr>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [recentLoans, setRecentLoans] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [penalites, setPenalites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, loansRes, activitiesRes, penalitesRes] = await Promise.all([
        api.get("/api/dashboard/stats/"),
        api.get("/api/emprunts/recents/"),
        api.get("/api/dashboard/activities/"),
        api.get("/api/penalites/"),
      ]);
      setStats(statsRes.data);
      setRecentLoans(loansRes.data.results || []);
      setActivities(activitiesRes.data.results || []);
      setPenalites(penalitesRes.data.results || []);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Impossible de charger les données.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handlePayer = async (penaliteId: number) => {
    try {
      await api.post(`/api/penalites/${penaliteId}/payer/`);
      await fetchDashboard();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Paiement impossible.");
    }
  };

  return (
    <RoleGuard allowed={["ADMIN"]}>
      <div className="space-y-6">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Emprunts totaux"
            value={stats?.resume?.nb_emprunts_total ?? (loading ? "..." : 0)}
            icon={<ClipboardList className="h-5 w-5" />}
          />
          <StatCard
            title="Emprunts en retard"
            value={stats?.resume?.nb_emprunts_en_retard ?? (loading ? "..." : 0)}
            icon={<AlertTriangle className="h-5 w-5" />}
          />
          <StatCard
            title="Pénalités impayées"
            value={stats?.resume?.nb_penalites_impayees ?? (loading ? "..." : 0)}
            icon={<Wallet className="h-5 w-5" />}
          />
          <StatCard
            title="Activités"
            value={activities.length}
            icon={<Calendar className="h-5 w-5" />}
            subtitle="Sur les 10 dernières opérations"
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
          <TableCard title="Emprunts récents">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-slate-400">
                <tr>
                  <th className="py-2">Ouvrage</th>
                  <th className="py-2">Lecteur</th>
                  <th className="py-2">Statut</th>
                  <th className="py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentLoans.map((loan) => (
                  <tr key={loan.id} className="border-t border-slate-100">
                    <td className="py-3 font-medium text-slate-700">{loan.ouvrage_titre}</td>
                    <td className="py-3 text-slate-600">{loan.adherent_username}</td>
                    <td className="py-3 text-slate-600">{loan.statut}</td>
                    <td className="py-3 text-slate-500">{formatDate(loan.date_emprunt)}</td>
                  </tr>
                ))}
                {!loading && recentLoans.length === 0 && <EmptyRow colSpan={4} />}
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

        <TableCard title="Pénalités récentes">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-slate-400">
              <tr>
                <th className="py-2">Lecteur</th>
                <th className="py-2">Ouvrage</th>
                <th className="py-2">Montant</th>
                <th className="py-2">Retard</th>
                <th className="py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {penalites.map((penalite) => (
                <tr key={penalite.id} className="border-t border-slate-100">
                  <td className="py-3 text-slate-700">{penalite.adherent_username}</td>
                  <td className="py-3 text-slate-600">{penalite.ouvrage_titre}</td>
                  <td className="py-3 text-slate-600">{formatMoney(penalite.montant)}</td>
                  <td className="py-3 text-slate-600">{penalite.jours_retard} j</td>
                  <td className="py-3 text-right">
                    {penalite.payee ? (
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                        Payée
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handlePayer(penalite.id)}
                        className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white"
                      >
                        Payer
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && penalites.length === 0 && <EmptyRow colSpan={5} />}
            </tbody>
          </table>
        </TableCard>
      </div>
    </RoleGuard>
  );
}
