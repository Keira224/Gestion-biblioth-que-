"use client";

import { useEffect, useState } from "react";
import { api } from "../../../../lib/api";
import { RoleGuard } from "../../../../components/RoleGuard";
import { TableCard } from "../../../../components/TableCard";
import { formatDate, formatMoney } from "../../../../lib/format";

export default function BibliothecairePenalitesPage() {
  const [penalites, setPenalites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPenalites = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/penalites/");
      setPenalites(response.data.results || []);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Impossible de charger les pénalités.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPenalites();
  }, []);

  const handlePayer = async (penaliteId: number) => {
    try {
      await api.post(`/api/penalites/${penaliteId}/payer/`);
      await fetchPenalites();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Paiement impossible.");
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

        <TableCard title="Pénalités">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-slate-400">
              <tr>
                <th className="py-2">Lecteur</th>
                <th className="py-2">Ouvrage</th>
                <th className="py-2">Montant</th>
                <th className="py-2">Créée le</th>
                <th className="py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {penalites.map((penalite) => (
                <tr key={penalite.id} className="border-t border-slate-100">
                  <td className="py-3 text-slate-700">{penalite.adherent_username}</td>
                  <td className="py-3 text-slate-600">{penalite.ouvrage_titre}</td>
                  <td className="py-3 text-slate-600">{formatMoney(penalite.montant)}</td>
                  <td className="py-3 text-slate-600">{formatDate(penalite.date_creation)}</td>
                  <td className="py-3 text-right">
                    {penalite.payee ? (
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                        Payée
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handlePayer(penalite.id)}
                        className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white"
                      >
                        Payer
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && penalites.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-sm text-slate-400">
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
