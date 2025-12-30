"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { api } from "../../../../lib/api";
import { RoleGuard } from "../../../../components/RoleGuard";
import { TableCard } from "../../../../components/TableCard";
import { Modal } from "../../../../components/Modal";

export default function BibliothecaireExemplairesPage() {
  const [ouvrages, setOuvrages] = useState<any[]>([]);
  const [selectedOuvrage, setSelectedOuvrage] = useState<string>("");
  const [exemplaires, setExemplaires] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [search, setSearch] = useState("");
  const [etatFilter, setEtatFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [nombre, setNombre] = useState("1");

  const fetchOuvrages = async () => {
    const response = await api.get("/api/catalogue/ouvrages/");
    setOuvrages(response.data.results || []);
    const firstId = response.data.results?.[0]?.id;
    if (firstId && !selectedOuvrage) {
      setSelectedOuvrage(String(firstId));
    }
  };

  const fetchExemplaires = async (ouvrageId: string, page = 1) => {
    if (!ouvrageId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/api/catalogue/ouvrages/${ouvrageId}/exemplaires/`, {
        params: {
          page,
          search: search || undefined,
          etat: etatFilter || undefined,
        },
      });
      setExemplaires(response.data.results || []);
      setPagination(response.data.pagination || { page: 1, pages: 1 });
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Impossible de charger les exemplaires.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOuvrages().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (selectedOuvrage) {
      fetchExemplaires(selectedOuvrage, 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOuvrage, search, etatFilter]);

  const handleAdd = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedOuvrage) return;
    setError(null);
    try {
      await api.post(`/api/catalogue/ouvrages/${selectedOuvrage}/exemplaires/`, {
        nombre: Number(nombre),
      });
      setOpen(false);
      setNombre("1");
      await fetchExemplaires(selectedOuvrage, pagination.page);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Ajout impossible.");
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

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-500">Ouvrage</label>
            <select
              value={selectedOuvrage}
              onChange={(event) => setSelectedOuvrage(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              {ouvrages.map((ouvrage) => (
                <option key={ouvrage.id} value={ouvrage.id}>
                  {ouvrage.titre}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
          >
            <Plus className="h-4 w-4" />
            Ajouter des exemplaires
          </button>
        </div>

        <TableCard title="Liste des exemplaires">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full max-w-xs rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Rechercher code barre..."
            />
            <select
              value={etatFilter}
              onChange={(event) => setEtatFilter(event.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Tous les états</option>
              <option value="DISPONIBLE">Disponible</option>
              <option value="EMPRUNTE">Emprunté</option>
            </select>
          </div>
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-slate-400">
              <tr>
                <th className="py-2">Code barre</th>
                <th className="py-2">État</th>
                <th className="py-2">Ouvrage</th>
                <th className="py-2">Emprunts</th>
                <th className="py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {exemplaires.map((exemplaire) => (
                <tr key={exemplaire.id} className="border-t border-slate-100">
                  <td className="py-3 text-slate-700">{exemplaire.code_barre}</td>
                  <td className="py-3 text-slate-600">{exemplaire.etat}</td>
                  <td className="py-3 text-slate-600">{exemplaire.ouvrage_titre}</td>
                  <td className="py-3 text-slate-600">{exemplaire.emprunts_count}</td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      onClick={async () => {
                        setError(null);
                        try {
                          await api.delete(`/api/catalogue/exemplaires/${exemplaire.id}/`);
                          await fetchExemplaires(selectedOuvrage, pagination.page);
                        } catch (err: any) {
                          setError(err?.response?.data?.detail || "Suppression impossible.");
                        }
                      }}
                      className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && exemplaires.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-sm text-slate-400">
                    Aucun exemplaire disponible.
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
                onClick={() => fetchExemplaires(selectedOuvrage, pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="rounded-lg border border-slate-200 px-3 py-1 disabled:opacity-50"
              >
                Précédent
              </button>
              <button
                type="button"
                onClick={() => fetchExemplaires(selectedOuvrage, pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="rounded-lg border border-slate-200 px-3 py-1 disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          </div>
        </TableCard>

        <Modal open={open} onClose={() => setOpen(false)} title="Ajouter des exemplaires">
          <form className="space-y-4" onSubmit={handleAdd}>
            <div>
              <label className="text-xs font-semibold text-slate-500">Nombre d'exemplaires</label>
              <input
                type="number"
                min={1}
                value={nombre}
                onChange={(event) => setNombre(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Ajouter
            </button>
          </form>
        </Modal>
      </div>
    </RoleGuard>
  );
}
