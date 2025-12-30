"use client";

import { useEffect, useState } from "react";
import { api } from "../../../../lib/api";
import { RoleGuard } from "../../../../components/RoleGuard";
import { TableCard } from "../../../../components/TableCard";
import { formatMoney } from "../../../../lib/format";

export default function LecteurEbooksPage() {
  const [ebooks, setEbooks] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [search, setSearch] = useState("");
  const [payantFilter, setPayantFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchEbooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/ebooks/", {
        params: {
          page: pagination.page,
          search: search || undefined,
          est_payant: payantFilter || undefined,
        },
      });
      setEbooks(response.data.results || []);
      setPagination(response.data.pagination || { page: 1, pages: 1 });
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Impossible de charger les e-books.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEbooks();
  }, [pagination.page, search, payantFilter]);

  const handleDownload = async (ebookId: number) => {
    setError(null);
    setMessage(null);
    try {
      const response = await api.get(`/api/ebooks/${ebookId}/download/`);
      if (response.data.url) {
        window.open(response.data.url, "_blank");
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Téléchargement impossible.");
    }
  };

  const handlePay = async (ebook: any) => {
    setError(null);
    setMessage(null);
    try {
      const init = await api.post("/api/paiements/initier/", {
        type: "EBOOK",
        reference_objet: ebook.id,
        montant: ebook.prix,
      });
      await api.post(`/api/paiements/${init.data.id}/payer/`);
      setMessage("Paiement validé. Téléchargement disponible.");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Paiement impossible.");
    }
  };

  return (
    <RoleGuard allowed={["LECTEUR"]}>
      <div className="space-y-6">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}
        {message && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
            {message}
          </div>
        )}

        <TableCard title="E-books disponibles">
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
              value={payantFilter}
              onChange={(event) => {
                setPagination((prev) => ({ ...prev, page: 1 }));
                setPayantFilter(event.target.value);
              }}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Tous</option>
              <option value="true">Payant</option>
              <option value="false">Gratuit</option>
            </select>
          </div>
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-slate-400">
              <tr>
                <th className="py-2">Nom</th>
                <th className="py-2">Format</th>
                <th className="py-2">Prix</th>
                <th className="py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {ebooks.map((ebook) => (
                <tr key={ebook.id} className="border-t border-slate-100">
                  <td className="py-3 text-slate-700">{ebook.nom_fichier}</td>
                  <td className="py-3 text-slate-600">{ebook.format}</td>
                  <td className="py-3 text-slate-600">
                    {ebook.est_payant ? formatMoney(ebook.prix) : "Gratuit"}
                  </td>
                  <td className="py-3 text-right space-x-2">
                    {ebook.est_payant && (
                      <button
                        type="button"
                        onClick={() => handlePay(ebook)}
                        className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white"
                      >
                        Payer
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDownload(ebook.id)}
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
                    >
                      Télécharger
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && ebooks.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-sm text-slate-400">
                    Aucun e-book.
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
