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

type Penalite = {
  id: number;
  ouvrage_titre: string;
  montant: string;
  payee: boolean;
  date_creation: string;
};

type Emprunt = {
  id: number;
  ouvrage_titre: string;
  date_emprunt: string;
  date_retour_prevue: string;
  statut: string;
};

type Activity = {
  id: number;
  message: string;
  created_at: string;
};

export default function LecteurDashboardPage() {
  useRoleGuard(["LECTEUR"]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [penalites, setPenalites] = useState<Penalite[]>([]);
  const [emprunts, setEmprunts] = useState<Emprunt[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, penalitesRes, empruntsRes, activitiesRes] = await Promise.all([
        api.get<DashboardStats>("/api/dashboard/stats/"),
        api.get<{ results: Penalite[] }>("/api/penalites/me/?page_size=5"),
        api.get<{ results: Emprunt[] }>("/api/emprunts/recents/?page_size=5"),
        api.get<{ results: Activity[] }>("/api/dashboard/activities/?page_size=5"),
      ]);
      setStats(statsRes.data);
      setPenalites(penalitesRes.data.results);
      setEmprunts(empruntsRes.data.results);
      setActivities(activitiesRes.data.results);
    } catch {
      setError("Impossible de charger le tableau de bord.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {error ? <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</div> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Mes emprunts" value={stats?.resume.nb_emprunts_total ?? "-"} icon={BookOpen} />
        <StatCard label="En retard" value={stats?.resume.nb_emprunts_en_retard ?? "-"} icon={Timer} tone="amber" />
        <StatCard
          label="Pénalités"
          value={stats?.resume.nb_penalites_impayees ?? "-"}
          icon={Ticket}
          tone="rose"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <TableCard title="Mes emprunts">
          {loading ? (
            <p className="text-sm text-slate-500">Chargement des emprunts...</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-slate-400">
                  <th className="py-2">Ouvrage</th>
                  <th>Emprunt</th>
                  <th>Retour prévu</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {emprunts.map((emprunt) => (
                  <tr key={emprunt.id} className="text-slate-600">
                    <td className="py-3 font-medium text-slate-700">{emprunt.ouvrage_titre}</td>
                    <td>{formatDate(emprunt.date_emprunt)}</td>
                    <td>{formatDate(emprunt.date_retour_prevue)}</td>
                    <td>{emprunt.statut}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </TableCard>

        <TableCard title="Mes activités">
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

      <TableCard title="Mes pénalités">
        {loading ? (
          <p className="text-sm text-slate-500">Chargement des pénalités...</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-slate-400">
                <th className="py-2">Ouvrage</th>
                <th>Montant</th>
                <th>Créée</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {penalites.map((penalite) => (
                <tr key={penalite.id} className="text-slate-600">
                  <td className="py-3 font-medium text-slate-700">{penalite.ouvrage_titre}</td>
                  <td>{formatCurrency(penalite.montant)}</td>
                  <td>{formatDate(penalite.date_creation)}</td>
                  <td>
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        penalite.payee ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {penalite.payee ? "Payée" : "Impayée"}
                    </span>
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
