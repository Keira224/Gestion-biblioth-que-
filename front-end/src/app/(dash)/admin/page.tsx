"use client";

import { useEffect, useState } from "react";
import { BookOpen, Ticket, Timer } from "lucide-react";

import { ActivityCard } from "@/components/ActivityCard";
import { StatCard } from "@/components/StatCard";
import { TableCard } from "@/components/TableCard";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import { useRoleGuard } from "@/lib/guard";

type DashboardStats = {
  resume: {
    nb_emprunts_total: number;
    nb_emprunts_en_retard: number;
    nb_penalites_impayees: number;
  };
};

type Activity = {
  id: number;
  message: string;
  created_at: string;
};

type Emprunt = {
  id: number;
  ouvrage_titre: string;
  adherent_username: string;
  date_emprunt: string;
  statut: string;
};

type Penalite = {
  id: number;
  ouvrage_titre: string;
  adherent_username: string;
  montant: string;
  payee: boolean;
};

export default function AdminDashboardPage() {
  const { loading: guardLoading } = useRoleGuard(["ADMIN"]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [recents, setRecents] = useState<Emprunt[]>([]);
  const [penalites, setPenalites] = useState<Penalite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, activitiesRes, recentsRes, penalitesRes] = await Promise.all([
        api.get<DashboardStats>("/api/dashboard/stats/"),
        api.get<{ results: Activity[] }>("/api/dashboard/activities/?page_size=5"),
        api.get<{ results: Emprunt[] }>("/api/emprunts/recents/?page_size=5"),
        api.get<{ results: Penalite[] }>("/api/penalites/?page_size=5"),
      ]);
      setStats(statsRes.data);
      setActivities(activitiesRes.data.results);
      setRecents(recentsRes.data.results);
      setPenalites(penalitesRes.data.results);
    } catch {
      setError("Impossible de charger les données du tableau de bord.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!guardLoading) {
      loadData();
    }
  }, [guardLoading]);

  const handlePayer = async (penaliteId: number) => {
    try {
      await api.post(`/api/penalites/${penaliteId}/payer/`);
      loadData();
    } catch {
      setError("Impossible de payer la pénalité.");
    }
  };

  return (
    <div className="space-y-6">
      {error ? <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</div> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Emprunts totaux"
          value={stats?.resume.nb_emprunts_total ?? "-"}
          icon={BookOpen}
          tone="blue"
        />
        <StatCard
          label="Emprunts en retard"
          value={stats?.resume.nb_emprunts_en_retard ?? "-"}
          icon={Timer}
          tone="amber"
        />
        <StatCard
          label="Pénalités impayées"
          value={stats?.resume.nb_penalites_impayees ?? "-"}
          icon={Ticket}
          tone="rose"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <TableCard title="Emprunts récents">
          {loading ? (
            <p className="text-sm text-slate-500">Chargement des emprunts...</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-slate-400">
                  <th className="py-2">Ouvrage</th>
                  <th>Lecteur</th>
                  <th>Date</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recents.map((item) => (
                  <tr key={item.id} className="text-slate-600">
                    <td className="py-3 font-medium text-slate-700">{item.ouvrage_titre}</td>
                    <td>{item.adherent_username}</td>
                    <td>{formatDate(item.date_emprunt)}</td>
                    <td>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs">{item.statut}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </TableCard>

        <TableCard title="Dernières activités">
          <div className="space-y-3">
            {loading ? (
              <p className="text-sm text-slate-500">Chargement des activités...</p>
            ) : (
              activities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  title={activity.message}
                  time={formatDate(activity.created_at)}
                />
              ))
            )}
          </div>
        </TableCard>
      </div>

      <TableCard title="Pénalités récentes">
        {loading ? (
          <p className="text-sm text-slate-500">Chargement des pénalités...</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-slate-400">
                <th className="py-2">Ouvrage</th>
                <th>Lecteur</th>
                <th>Montant</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {penalites.map((penalite) => (
                <tr key={penalite.id} className="text-slate-600">
                  <td className="py-3 font-medium text-slate-700">{penalite.ouvrage_titre}</td>
                  <td>{penalite.adherent_username}</td>
                  <td>{formatCurrency(penalite.montant)}</td>
                  <td>
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        penalite.payee ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {penalite.payee ? "Payée" : "Impayée"}
                    </span>
                  </td>
                  <td className="text-right">
                    {!penalite.payee ? (
                      <button
                        type="button"
                        onClick={() => handlePayer(penalite.id)}
                        className="rounded-lg bg-brand-600 px-3 py-1 text-xs text-white"
                      >
                        Payer
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableCard>
    </div>
  );
}
