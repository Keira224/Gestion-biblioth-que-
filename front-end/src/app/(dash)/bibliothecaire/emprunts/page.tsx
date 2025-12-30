"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { api } from "../../../../lib/api";
import { RoleGuard } from "../../../../components/RoleGuard";
import { TableCard } from "../../../../components/TableCard";
import { Modal } from "../../../../components/Modal";
import { formatDate } from "../../../../lib/format";

export default function BibliothecaireEmpruntsPage() {
  const [emprunts, setEmprunts] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [search, setSearch] = useState("");
  const [adherents, setAdherents] = useState<any[]>([]);
  const [exemplaires, setExemplaires] = useState<any[]>([]);
  const [form, setForm] = useState({ adherentId: "", exemplaireId: "" });
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [empruntsRes, adherentsRes, exemplairesRes] = await Promise.all([
        api.get("/api/emprunts/en-cours/", {
          params: { page: pagination.page, search: search || undefined },
        }),
        api.get("/api/adherents/"),
        api.get("/api/catalogue/exemplaires-disponibles/"),
      ]);
      setEmprunts(empruntsRes.data.results || []);
      setPagination(empruntsRes.data.pagination || { page: 1, pages: 1 });
      setAdherents(adherentsRes.data.results || []);
      setExemplaires(exemplairesRes.data.results || []);
      if (!form.adherentId && adherentsRes.data.results?.length) {
        setForm((prev) => ({ ...prev, adherentId: String(adherentsRes.data.results[0].id) }));
      }
      if (!form.exemplaireId && exemplairesRes.data.results?.length) {
        setForm((prev) => ({ ...prev, exemplaireId: String(exemplairesRes.data.results[0].id) }));
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Impossible de charger les emprunts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, search]);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    try {
      await api.post("/api/emprunts/creer/", {
        adherent_id: Number(form.adherentId),
        exemplaire_id: Number(form.exemplaireId),
      });
      setOpen(false);
      await fetchData();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Création impossible.");
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

        <TableCard
          title="Emprunts en cours"
          action={
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" />
              Créer emprunt
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
          </div>
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-slate-400">
              <tr>
                <th className="py-2">Lecteur</th>
                <th className="py-2">Ouvrage</th>
                <th className="py-2">Date emprunt</th>
                <th className="py-2">Retour prévu</th>
              </tr>
            </thead>
            <tbody>
              {emprunts.map((emprunt) => (
                <tr key={emprunt.id} className="border-t border-slate-100">
                  <td className="py-3 text-slate-700">{emprunt.adherent_username}</td>
                  <td className="py-3 text-slate-600">{emprunt.ouvrage_titre}</td>
                  <td className="py-3 text-slate-600">{formatDate(emprunt.date_emprunt)}</td>
                  <td className="py-3 text-slate-600">{formatDate(emprunt.date_retour_prevue)}</td>
                </tr>
              ))}
              {!loading && emprunts.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-sm text-slate-400">
                    Aucun emprunt en cours.
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

        <Modal open={open} onClose={() => setOpen(false)} title="Créer un emprunt">
          <form className="space-y-4" onSubmit={handleCreate}>
            <div>
              <label className="text-xs font-semibold text-slate-500">Adhérent</label>
              <select
                value={form.adherentId}
                onChange={(event) => setForm({ ...form, adherentId: event.target.value })}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              >
                {adherents.map((adherent) => (
                  <option key={adherent.id} value={adherent.id}>
                    {adherent.prenom} {adherent.nom} ({adherent.username})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Exemplaire disponible</label>
              <select
                value={form.exemplaireId}
                onChange={(event) => setForm({ ...form, exemplaireId: event.target.value })}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              >
                {exemplaires.map((exemplaire) => (
                  <option key={exemplaire.id} value={exemplaire.id}>
                    {exemplaire.ouvrage_titre} · {exemplaire.code_barre}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Créer l'emprunt
            </button>
          </form>
        </Modal>
      </div>
    </RoleGuard>
  );
}
