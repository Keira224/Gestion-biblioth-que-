"use client";

import { useEffect, useState } from "react";
import { api } from "../../../../lib/api";
import { RoleGuard } from "../../../../components/RoleGuard";
import { TableCard } from "../../../../components/TableCard";
import { formatDate, formatMoney } from "../../../../lib/format";

export default function LecteurPenalitesPage() {
  const [penalites, setPenalites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPenalites = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get("/api/penalites/me/");
        setPenalites(response.data.results || []);
      } catch (err: any) {
        setError(err?.response?.data?.detail || "Impossible de charger vos pénalités.");
      } finally {
        setLoading(false);
      }
    };
    fetchPenalites();
  }, []);

  return (
    <RoleGuard allowed={["LECTEUR"]}>
      <div className="space-y-6">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <TableCard title="Mes pénalités">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-slate-400">
              <tr>
                <th className="py-2">Ouvrage</th>
                <th className="py-2">Montant</th>
                <th className="py-2">Créée le</th>
                <th className="py-2">Statut</th>
              </tr>
            </thead>
            <tbody>
              {penalites.map((penalite) => (
                <tr key={penalite.id} className="border-t border-slate-100">
                  <td className="py-3 text-slate-700">{penalite.ouvrage_titre}</td>
                  <td className="py-3 text-slate-600">{formatMoney(penalite.montant)}</td>
                  <td className="py-3 text-slate-600">{formatDate(penalite.date_creation)}</td>
                  <td className="py-3 text-slate-600">{penalite.payee ? "Payée" : "Impayée"}</td>
                </tr>
              ))}
              {!loading && penalites.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-sm text-slate-400">
                    Aucune pénalité.
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
