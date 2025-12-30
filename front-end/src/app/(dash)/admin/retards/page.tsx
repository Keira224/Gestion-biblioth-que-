"use client";

import { useEffect, useState } from "react";
import { api } from "../../../../lib/api";
import { RoleGuard } from "../../../../components/RoleGuard";
import { TableCard } from "../../../../components/TableCard";
import { formatDate } from "../../../../lib/format";

export default function AdminRetardsPage() {
  const [retards, setRetards] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRetards = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get("/api/emprunts/retards/", {
          params: {
            page: pagination.page,
            search: search || undefined,
          },
        });
        setRetards(response.data.results || []);
        setPagination(response.data.pagination || { page: 1, pages: 1 });
      } catch (err: any) {
        setError(err?.response?.data?.detail || "Impossible de charger les retards.");
      } finally {
        setLoading(false);
      }
    };
    fetchRetards();
  }, [pagination.page, search]);

  return (
    <RoleGuard allowed={["ADMIN"]}>
      <div className="space-y-6">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <TableCard title="Emprunts en retard">
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
          </div>
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-slate-400">
              <tr>
                <th className="py-2">Lecteur</th>
                <th className="py-2">Ouvrage</th>
                <th className="py-2">Retard (jours)</th>
                <th className="py-2">Date prévue</th>
              </tr>
            </thead>
            <tbody>
              {retards.map((retard) => (
                <tr key={retard.id} className="border-t border-slate-100">
                  <td className="py-3 text-slate-700">{retard.adherent_username}</td>
                  <td className="py-3 text-slate-600">{retard.ouvrage_titre}</td>
                  <td className="py-3 text-slate-600">{retard.jours_retard}</td>
                  <td className="py-3 text-slate-600">{formatDate(retard.date_retour_prevue)}</td>
                </tr>
              ))}
              {!loading && retards.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-sm text-slate-400">
                    Aucun retard détecté.
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
