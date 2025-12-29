"use client";

import { useEffect, useState } from "react";
import { api } from "../../../../lib/api";
import { RoleGuard } from "../../../../components/RoleGuard";
import { TableCard } from "../../../../components/TableCard";
import { formatDate } from "../../../../lib/format";

export default function AdminEmpruntsPage() {
  const [emprunts, setEmprunts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmprunts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get("/api/emprunts/historique/");
        setEmprunts(response.data.results || []);
      } catch (err: any) {
        setError(err?.response?.data?.detail || "Impossible de charger les emprunts.");
      } finally {
        setLoading(false);
      }
    };
    fetchEmprunts();
  }, []);

  return (
    <RoleGuard allowed={["ADMIN"]}>
      <div className="space-y-6">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <TableCard title="Gestion des emprunts">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-slate-400">
              <tr>
                <th className="py-2">Lecteur</th>
                <th className="py-2">Ouvrage</th>
                <th className="py-2">Statut</th>
                <th className="py-2">Date emprunt</th>
                <th className="py-2">Retour prévu</th>
              </tr>
            </thead>
            <tbody>
              {emprunts.map((emprunt) => (
                <tr key={emprunt.id} className="border-t border-slate-100">
                  <td className="py-3 text-slate-700">{emprunt.adherent_username}</td>
                  <td className="py-3 text-slate-600">{emprunt.ouvrage_titre}</td>
                  <td className="py-3 text-slate-600">{emprunt.statut}</td>
                  <td className="py-3 text-slate-600">{formatDate(emprunt.date_emprunt)}</td>
                  <td className="py-3 text-slate-600">{formatDate(emprunt.date_retour_prevue)}</td>
                </tr>
              ))}
              {!loading && emprunts.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-sm text-slate-400">
                    Aucun emprunt à afficher.
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
