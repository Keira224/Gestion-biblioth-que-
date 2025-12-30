"use client";

import { useEffect, useState } from "react";
import { api } from "../../../../lib/api";
import { RoleGuard } from "../../../../components/RoleGuard";
import { TableCard } from "../../../../components/TableCard";
import { formatDate, formatMoney } from "../../../../lib/format";

export default function AdminPenalitesPage() {
  const [penalites, setPenalites] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [search, setSearch] = useState("");
  const [payeeFilter, setPayeeFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPenalites = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/penalites/", {
        params: {
          page: pagination.page,
          search: search || undefined,
          payee: payeeFilter || undefined,
        },
      });
      setPenalites(response.data.results || []);
      setPagination(response.data.pagination || { page: 1, pages: 1 });
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Impossible de charger les pénalités.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPenalites();
  }, [pagination.page, search, payeeFilter]);

  const handlePayer = async (penaliteId: number) => {
    try {
      await api.post(`/api/penalites/${penaliteId}/payer/`);
      await fetchPenalites();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Paiement impossible.");
    }
  };

  return (
    <RoleGuard allowed={["ADMIN"]}>
      <div className="space-y-6">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <TableCard title="Gestion des pénalités">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <input
              value={search}
              onChange={(event) => {
                setPagination((prev) => ({ ...prev, page: 1 }));
                setSearch(event.target.value);
              }}
              className="w-full max-w-xs rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Rechercher..."
            />
            <select
              value={payeeFilter}
              onChange={(event) => {
                setPagination((prev) => ({ ...prev, page: 1 }));
                setPayeeFilter(event.target.value);
              }}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Tous les statuts</option>
              <option value="true">Payée</option>
              <option value="false">Impayée</option>
            </select>
          </div>
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
                    Aucune pénalité à afficher.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
            <span>
              Page {pagination.page} / {pagination.pages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page <= 1}
                className="rounded-lg border border-slate-200 px-3 py-1 disabled:opacity-50"
              >
                Précédent
              </button>
              <button
                type="button"
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= pagination.pages}
                className="rounded-lg border border-slate-200 px-3 py-1 disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          </div>
        </TableCard>
      </div>
    </RoleGuard>
  );
}
