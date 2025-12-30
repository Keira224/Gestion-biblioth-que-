"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { api } from "../../../../lib/api";
import { RoleGuard } from "../../../../components/RoleGuard";
import { TableCard } from "../../../../components/TableCard";
import { Modal } from "../../../../components/Modal";
import { formatDate } from "../../../../lib/format";

export default function LecteurDemandesPage() {
  const [demandes, setDemandes] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [search, setSearch] = useState("");
  const [statutFilter, setStatutFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    titre: "",
    auteur: "",
    isbn: "",
    description: "",
    urgence: "",
  });

  const fetchDemandes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/demandes-livres/me/", {
        params: {
          page: pagination.page,
          search: search || undefined,
          statut: statutFilter || undefined,
        },
      });
      setDemandes(response.data.results || []);
      setPagination(response.data.pagination || { page: 1, pages: 1 });
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Impossible de charger vos demandes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemandes();
  }, [pagination.page, search, statutFilter]);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    try {
      await api.post("/api/demandes-livres/", {
        titre: form.titre,
        auteur: form.auteur || undefined,
        isbn: form.isbn || undefined,
        description: form.description || undefined,
        urgence: form.urgence || undefined,
      });
      setOpen(false);
      setForm({ titre: "", auteur: "", isbn: "", description: "", urgence: "" });
      await fetchDemandes();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Création impossible.");
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

        <TableCard
          title="Mes demandes de livres"
          action={
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" />
              Nouvelle demande
            </button>
          }
        >
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
              <option value="EN_ATTENTE">En attente</option>
              <option value="EN_RECHERCHE">En recherche</option>
              <option value="TROUVE">Trouvé</option>
              <option value="INDISPONIBLE">Indisponible</option>
              <option value="CLOTUREE">Clôturée</option>
            </select>
          </div>
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-slate-400">
              <tr>
                <th className="py-2">Titre</th>
                <th className="py-2">Auteur</th>
                <th className="py-2">Statut</th>
                <th className="py-2">Créée le</th>
              </tr>
            </thead>
            <tbody>
              {demandes.map((demande) => (
                <tr key={demande.id} className="border-t border-slate-100">
                  <td className="py-3 text-slate-700">{demande.titre}</td>
                  <td className="py-3 text-slate-600">{demande.auteur || "-"}</td>
                  <td className="py-3 text-slate-600">{demande.statut}</td>
                  <td className="py-3 text-slate-600">{formatDate(demande.date_creation)}</td>
                </tr>
              ))}
              {!loading && demandes.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-sm text-slate-400">
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

        <Modal open={open} onClose={() => setOpen(false)} title="Créer une demande de livre">
          <form className="space-y-4" onSubmit={handleCreate}>
            <div>
              <label className="text-xs font-semibold text-slate-500">Titre</label>
              <input
                value={form.titre}
                onChange={(event) => setForm({ ...form, titre: event.target.value })}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                required
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-slate-500">Auteur</label>
                <input
                  value={form.auteur}
                  onChange={(event) => setForm({ ...form, auteur: event.target.value })}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">ISBN</label>
                <input
                  value={form.isbn}
                  onChange={(event) => setForm({ ...form, isbn: event.target.value })}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Description / lien</label>
              <textarea
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                rows={3}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Urgence / priorité</label>
              <input
                value={form.urgence}
                onChange={(event) => setForm({ ...form, urgence: event.target.value })}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Envoyer la demande
            </button>
          </form>
        </Modal>
      </div>
    </RoleGuard>
  );
}
