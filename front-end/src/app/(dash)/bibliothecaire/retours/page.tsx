"use client";

import { useEffect, useState } from "react";
import { api } from "../../../../lib/api";
import { RoleGuard } from "../../../../components/RoleGuard";
import { TableCard } from "../../../../components/TableCard";
import { formatDate } from "../../../../lib/format";

export default function BibliothecaireRetoursPage() {
  const [emprunts, setEmprunts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmprunts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/emprunts/en-cours/");
      setEmprunts(response.data.results || []);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Impossible de charger les retours.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmprunts();
  }, []);

  const handleRetour = async (empruntId: number) => {
    try {
      await api.post(`/api/emprunts/${empruntId}/retour/`);
      await fetchEmprunts();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Retour impossible.");
    }
  };

  return (
    <RoleGuard allowed={["BIBLIOTHECAIRE"]}>
      <div className="space-y-6">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <TableCard title="Gestion des retours">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-slate-400">
              <tr>
                <th className="py-2">Lecteur</th>
                <th className="py-2">Ouvrage</th>
                <th className="py-2">Retour prévu</th>
                <th className="py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {emprunts.map((emprunt) => (
                <tr key={emprunt.id} className="border-t border-slate-100">
                  <td className="py-3 text-slate-700">{emprunt.adherent_username}</td>
                  <td className="py-3 text-slate-600">{emprunt.ouvrage_titre}</td>
                  <td className="py-3 text-slate-600">{formatDate(emprunt.date_retour_prevue)}</td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleRetour(emprunt.id)}
                      className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white"
                    >
                      Enregistrer retour
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && emprunts.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-sm text-slate-400">
                    Aucun retour à enregistrer.
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
