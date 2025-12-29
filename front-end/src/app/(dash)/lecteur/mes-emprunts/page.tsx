"use client";

import { useEffect, useState } from "react";

import { TableCard } from "@/components/TableCard";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { useRoleGuard } from "@/lib/guard";

type Emprunt = {
  id: number;
  ouvrage_titre: string;
  date_emprunt: string;
  date_retour_prevue: string;
  date_retour_effective?: string | null;
  statut: string;
};

export default function LecteurMesEmpruntsPage() {
  useRoleGuard(["LECTEUR"]);
  const [emprunts, setEmprunts] = useState<Emprunt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEmprunts = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<{ results: Emprunt[] }>("/api/emprunts/historique/?page_size=20");
      setEmprunts(data.results);
    } catch {
      setError("Impossible de charger vos emprunts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmprunts();
  }, []);

  return (
    <div className="space-y-6">
      {error ? <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</div> : null}

      <TableCard title="Mes emprunts">
        {loading ? (
          <p className="text-sm text-slate-500">Chargement de vos emprunts...</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-slate-400">
                <th className="py-2">Ouvrage</th>
                <th>Emprunt</th>
                <th>Retour prévu</th>
                <th>Retour</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {emprunts.map((emprunt) => (
                <tr key={emprunt.id} className="text-slate-600">
                  <td className="py-3 font-medium text-slate-700">{emprunt.ouvrage_titre}</td>
                  <td>{formatDate(emprunt.date_emprunt)}</td>
                  <td>{formatDate(emprunt.date_retour_prevue)}</td>
                  <td>{formatDate(emprunt.date_retour_effective)}</td>
                  <td>{emprunt.statut}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableCard>
    </div>
  );
}
