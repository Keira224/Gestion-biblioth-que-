"use client";

import { useEffect, useState } from "react";
import { api } from "../../../../lib/api";
import { RoleGuard } from "../../../../components/RoleGuard";
import { TableCard } from "../../../../components/TableCard";
import { formatMoney } from "../../../../lib/format";

export default function LecteurEbooksPage() {
  const [ebooks, setEbooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchEbooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/ebooks/");
      setEbooks(response.data.results || []);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Impossible de charger les e-books.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEbooks();
  }, []);

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
        </TableCard>
      </div>
    </RoleGuard>
  );
}
