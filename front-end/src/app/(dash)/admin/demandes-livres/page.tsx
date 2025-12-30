"use client";

import { useEffect, useState } from "react";
import { api } from "../../../../lib/api";
import { RoleGuard } from "../../../../components/RoleGuard";
import { TableCard } from "../../../../components/TableCard";
import { Modal } from "../../../../components/Modal";
import { formatDate } from "../../../../lib/format";

const statuts = [
  "EN_ATTENTE",
  "EN_RECHERCHE",
  "TROUVE",
  "INDISPONIBLE",
  "CLOTUREE",
];

export default function AdminDemandesLivresPage() {
  const [demandes, setDemandes] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [search, setSearch] = useState("");
  const [statutFilter, setStatutFilter] = useState("");
  const [ouvrages, setOuvrages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);
  const [form, setForm] = useState({ statut: "EN_ATTENTE", ouvrage_id: "" });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [demandesRes, ouvragesRes] = await Promise.all([
        api.get("/api/demandes-livres/", {
          params: {
            page: pagination.page,
            search: search || undefined,
            statut: statutFilter || undefined,
          },
        }),
        api.get("/api/catalogue/ouvrages/"),
      ]);
      setDemandes(demandesRes.data.results || []);
      setPagination(demandesRes.data.pagination || { page: 1, pages: 1 });
      setOuvrages(ouvragesRes.data.results || []);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Impossible de charger les demandes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, search, statutFilter]);

  const openModal = (demande: any) => {
    setSelected(demande);
    setForm({
      statut: demande.statut,
      ouvrage_id: demande.ouvrage || "",
    });
    setOpen(true);
  };

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected) return;
    setError(null);
    try {
      await api.post(`/api/demandes-livres/${selected.id}/status/`, {
        statut: form.statut,
        ouvrage_id: form.ouvrage_id || undefined,
      });
      setOpen(false);
      await fetchData();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Mise à jour impossible.");
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

        <TableCard title="Demandes de livres">
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
              value={statutFilter}
              onChange={(event) => {
                setPagination((prev) => ({ ...prev, page: 1 }));
                setStatutFilter(event.target.value);
              }}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Tous les statuts</option>
              {statuts.map((statut) => (
                <option key={statut} value={statut}>
                  {statut}
                </option>
              ))}
            </select>
          </div>
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-slate-400">
              <tr>
                <th className="py-2">Lecteur</th>
                <th className="py-2">Titre</th>
                <th className="py-2">Statut</th>
                <th className="py-2">Créée le</th>
                <th className="py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {demandes.map((demande) => (
                <tr key={demande.id} className="border-t border-slate-100">
                  <td className="py-3 text-slate-700">{demande.adherent_username}</td>
                  <td className="py-3 text-slate-600">{demande.titre}</td>
                  <td className="py-3 text-slate-600">{demande.statut}</td>
                  <td className="py-3 text-slate-600">{formatDate(demande.date_creation)}</td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      onClick={() => openModal(demande)}
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
                    >
                      Mettre à jour
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && demandes.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-sm text-slate-400">
                    Aucune demande.
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

        <Modal open={open} onClose={() => setOpen(false)} title="Mettre à jour la demande">
          <form className="space-y-4" onSubmit={handleUpdate}>
            <div>
              <label className="text-xs font-semibold text-slate-500">Statut</label>
              <select
                value={form.statut}
                onChange={(event) => setForm({ ...form, statut: event.target.value })}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              >
                {statuts.map((statut) => (
                  <option key={statut} value={statut}>
                    {statut}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Associer un ouvrage</label>
              <select
                value={form.ouvrage_id}
                onChange={(event) => setForm({ ...form, ouvrage_id: event.target.value })}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="">Aucun</option>
                {ouvrages.map((ouvrage) => (
                  <option key={ouvrage.id} value={ouvrage.id}>
                    {ouvrage.titre}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Enregistrer
            </button>
          </form>
        </Modal>
      </div>
    </RoleGuard>
  );
}
