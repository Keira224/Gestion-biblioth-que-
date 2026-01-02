"use client";

import { useEffect, useState } from "react";
import { api } from "../../../../lib/api";
import { RoleGuard } from "../../../../components/RoleGuard";
import { BarList } from "../../../../components/BarList";
import { StatCard } from "../../../../components/StatCard";

export default function BibliothecaireStatistiquesPage() {
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
    <RoleGuard allowed={["BIBLIOTHECAIRE"]}>
      <div className="space-y-6">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          <StatCard
            title="Emprunts totaux"
            value={stats?.resume?.nb_emprunts_total ?? (loading ? "..." : 0)}
            subtitle="Tous les emprunts enregistres"
          />
          <StatCard
            title="Emprunts en retard"
            value={stats?.resume?.nb_emprunts_en_retard ?? (loading ? "..." : 0)}
            subtitle="Retards en cours"
          />
          <StatCard
            title="Penalites impayees"
            value={stats?.resume?.nb_penalites_impayees ?? (loading ? "..." : 0)}
            subtitle="A regler"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <BarList
            title="Lecteurs les plus actifs"
            emptyLabel="Aucun lecteur a afficher."
            items={(stats?.lecteurs_plus_actifs || []).map((item: any) => ({
              label: item.adherent__user__username,
              value: item.total,
            }))}
          />

          <BarList
            title="Retards frequents"
            emptyLabel="Aucun retard a afficher."
            items={(stats?.retards_frequents || []).map((item: any) => ({
              label: item.adherent__user__username,
              value: item.total,
            }))}
          />

          <BarList
            title="Ouvrages les plus empruntes"
            emptyLabel="Aucun ouvrage a afficher."
            items={(stats?.ouvrages_plus_empruntes || []).map((item: any) => ({
              label: item.exemplaire__ouvrage__titre,
              value: item.total,
            }))}
          />

          <BarList
            title="Taux de rotation des ouvrages"
            emptyLabel="Aucun taux de rotation a afficher."
            items={(stats?.taux_rotation_ouvrages || []).map((item: any) => ({
              label: item.titre,
              value: item.taux_rotation,
              meta: `Emprunts ${item.total_emprunts} / Exemplaires ${item.nb_exemplaires}`,
            }))}
          />
        </div>
      </div>
    </RoleGuard>
  );
}
