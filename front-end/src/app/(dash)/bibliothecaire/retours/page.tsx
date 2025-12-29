"use client";

import { useEffect, useState } from "react";

import { TableCard } from "@/components/TableCard";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { useRoleGuard } from "@/lib/guard";

type Emprunt = {
  id: number;
  ouvrage_titre: string;
  exemplaire_code: string;
  adherent_username: string;
  date_emprunt: string;
  date_retour_prevue: string;
};

export default function BibliothecaireRetoursPage() {
  useRoleGuard(["BIBLIOTHECAIRE"]);
  const [emprunts, setEmprunts] = useState<Emprunt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEmprunts = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<{ results: Emprunt[] }>("/api/emprunts/en-cours/?page_size=20");
      setEmprunts(data.results);
    } catch {
      setError("Impossible de charger les emprunts en cours.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmprunts();
  }, []);

  const handleRetour = async (empruntId: number) => {
    try {
      await api.post(`/api/emprunts/${empruntId}/retour/`);
      loadEmprunts();
    } catch {
      setError("Impossible d'enregistrer le retour.");
    }
  };

  return (
    <div className="space-y-6">
      {error ? <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</div> : null}

      <TableCard title="Retours à enregistrer">
        {loading ? (
          <p className="text-sm text-slate-500">Chargement des emprunts...</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-slate-400">
                <th className="py-2">Ouvrage</th>
                <th>Exemplaire</th>
                <th>Lecteur</th>
                <th>Emprunt</th>
                <th>Retour prévu</th>
                <th></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {emprunts.map((emprunt) => (
                <tr key={emprunt.id} className="text-slate-600">
                  <td className="py-3 font-medium text-slate-700">{emprunt.ouvrage_titre}</td>
                  <td>{emprunt.exemplaire_code}</td>
                  <td>{emprunt.adherent_username}</td>
                  <td>{formatDate(emprunt.date_emprunt)}</td>
                  <td>{formatDate(emprunt.date_retour_prevue)}</td>
                  <td className="text-right">
                    <button
                      type="button"
                      onClick={() => handleRetour(emprunt.id)}
                      className="rounded-lg bg-brand-600 px-3 py-1 text-xs text-white"
                    >
                      Enregistrer retour
                    </button>
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
