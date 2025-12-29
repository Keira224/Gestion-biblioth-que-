"use client";

import { useEffect, useState } from "react";

import { TableCard } from "@/components/TableCard";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import { useRoleGuard } from "@/lib/guard";

type Penalite = {
  id: number;
  ouvrage_titre: string;
  montant: string;
  jours_retard: number;
  payee: boolean;
  date_creation: string;
};

export default function LecteurMesPenalitesPage() {
  useRoleGuard(["LECTEUR"]);
  const [penalites, setPenalites] = useState<Penalite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPenalites = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<{ results: Penalite[] }>("/api/penalites/me/?page_size=20");
      setPenalites(data.results);
    } catch {
      setError("Impossible de charger vos pénalités.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPenalites();
  }, []);

  return (
    <div className="space-y-6">
      {error ? <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</div> : null}

      <TableCard title="Mes pénalités">
        {loading ? (
          <p className="text-sm text-slate-500">Chargement de vos pénalités...</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-slate-400">
                <th className="py-2">Ouvrage</th>
                <th>Jours retard</th>
                <th>Montant</th>
                <th>Créée</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {penalites.map((penalite) => (
                <tr key={penalite.id} className="text-slate-600">
                  <td className="py-3 font-medium text-slate-700">{penalite.ouvrage_titre}</td>
                  <td>{penalite.jours_retard}</td>
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
