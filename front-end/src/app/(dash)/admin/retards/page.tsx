"use client";

import { useEffect, useState } from "react";

import { TableCard } from "@/components/TableCard";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { useRoleGuard } from "@/lib/guard";

type EmpruntRetard = {
  id: number;
  ouvrage_titre: string;
  exemplaire_code: string;
  adherent_username: string;
  date_retour_prevue: string;
  jours_retard: number;
};

export default function AdminRetardsPage() {
  useRoleGuard(["ADMIN"]);
  const [retards, setRetards] = useState<EmpruntRetard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRetards = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<{ results: EmpruntRetard[] }>("/api/emprunts/retards/?page_size=20");
      setRetards(data.results);
    } catch {
      setError("Impossible de charger les retards.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRetards();
  }, []);

  return (
    <div className="space-y-6">
      {error ? <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</div> : null}

      <TableCard title="Emprunts en retard">
        {loading ? (
          <p className="text-sm text-slate-500">Chargement des retards...</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-slate-400">
                <th className="py-2">Ouvrage</th>
                <th>Lecteur</th>
                <th>Exemplaire</th>
                <th>Retour prévu</th>
                <th>Jours de retard</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {retards.map((retard) => (
                <tr key={retard.id} className="text-slate-600">
                  <td className="py-3 font-medium text-slate-700">{retard.ouvrage_titre}</td>
                  <td>{retard.adherent_username}</td>
                  <td>{retard.exemplaire_code}</td>
                  <td>{formatDate(retard.date_retour_prevue)}</td>
                  <td>{retard.jours_retard}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableCard>
    </div>
  );
}
