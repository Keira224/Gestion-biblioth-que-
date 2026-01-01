"use client";

import { useEffect, useState } from "react";
import { Plus, SearchX } from "lucide-react";
import { api } from "../../../../lib/api";
import { RoleGuard } from "../../../../components/RoleGuard";
import { TableCard } from "../../../../components/TableCard";
import { Modal } from "../../../../components/Modal";
import { formatApiError } from "../../../../lib/format";

export default function BibliothecaireOuvragesPage() {
  const [ouvrages, setOuvrages] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState({
    isbn: "",
    titre: "",
    auteur: "",
    editeur: "",
    annee: "",
    categorie: "",
    type_ressource: "LIVRE",
    nombre_exemplaires: "",
  });
  const [editForm, setEditForm] = useState({
    isbn: "",
    titre: "",
    auteur: "",
    editeur: "",
    annee: "",
    categorie: "",
    type_ressource: "LIVRE",
    disponible: true,
  });

  useEffect(() => {
    const fetchOuvrages = async (page = 1) => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get("/api/catalogue/ouvrages/", {
          params: {
            page,
            search: search || undefined,
            type_ressource: typeFilter || undefined,
          },
        });
        setOuvrages(response.data.results || []);
        setPagination(response.data.pagination || { page: 1, pages: 1 });
      } catch (err: any) {
        setError(formatApiError(err, "Impossible de charger le catalogue."));
      } finally {
        setLoading(false);
      }
    };
    fetchOuvrages(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, typeFilter]);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    try {
      await api.post("/api/catalogue/ouvrages/", {
        isbn: form.isbn,
        titre: form.titre,
        auteur: form.auteur,
        editeur: form.editeur || undefined,
        annee: form.annee ? Number(form.annee) : undefined,
        categorie: form.categorie,
        type_ressource: form.type_ressource,
        nombre_exemplaires: form.nombre_exemplaires ? Number(form.nombre_exemplaires) : 0,
      });
      setOpen(false);
      setForm({
        isbn: "",
        titre: "",
        auteur: "",
        editeur: "",
        annee: "",
        categorie: "",
        type_ressource: "LIVRE",
        nombre_exemplaires: "",
      });
      const response = await api.get("/api/catalogue/ouvrages/", {
        params: { page: pagination.page, search: search || undefined, type_ressource: typeFilter || undefined },
      });
      setOuvrages(response.data.results || []);
    } catch (err: any) {
      setError(formatApiError(err, "Création impossible."));
    }
  };

  const openEditModal = (ouvrage: any) => {
    setSelectedId(ouvrage.id);
    setEditForm({
      isbn: ouvrage.isbn,
      titre: ouvrage.titre,
      auteur: ouvrage.auteur,
      editeur: ouvrage.editeur || "",
      annee: ouvrage.annee ? String(ouvrage.annee) : "",
      categorie: ouvrage.categorie,
      type_ressource: ouvrage.type_ressource,
      disponible: ouvrage.disponible,
    });
    setEditOpen(true);
  };

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedId) return;
    setError(null);
    try {
      await api.patch(`/api/catalogue/ouvrages/${selectedId}/`, {
        isbn: editForm.isbn,
        titre: editForm.titre,
        auteur: editForm.auteur,
        editeur: editForm.editeur || undefined,
        annee: editForm.annee ? Number(form.annee) : undefined,
        categorie: editForm.categorie,
        type_ressource: editForm.type_ressource,
        disponible: editForm.disponible,
      });
      setEditOpen(false);
      const response = await api.get("/api/catalogue/ouvrages/", {
        params: { page: pagination.page, search: search || undefined, type_ressource: typeFilter || undefined },
      });
      setOuvrages(response.data.results || []);
    } catch (err: any) {
      setError(formatApiError(err, "Modification impossible."));
    }
  };

  const handleDelete = async (ouvrage: any) => {
    const confirmed = confirm(
      `Vous supprimez l'ouvrage "${ouvrage.titre}" (exemplaires disponibles : ${ouvrage.exemplaires_disponibles}). Continuer ?`,
    );
    if (!confirmed) return;
    setError(null);
    try {
      await api.delete(`/api/catalogue/ouvrages/${ouvrage.id}/`);
      const response = await api.get("/api/catalogue/ouvrages/", {
        params: { page: pagination.page, search: search || undefined, type_ressource: typeFilter || undefined },
      });
      setOuvrages(response.data.results || []);
    } catch (err: any) {
      setError(formatApiError(err, "Suppression impossible."));
    }
  };

  const hasFilters = Boolean(search || typeFilter);

  return (
    <RoleGuard allowed={["BIBLIOTHECAIRE"]}>
      <div className="space-y-6">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <TableCard
          title="Catalogue des ouvrages"
          action={
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" />
              Ajouter un ouvrage
            </button>
          }
          helper={
            <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <div className="space-y-1">
                <p className="font-semibold text-slate-700">Actions intelligentes</p>
                {hasFilters ? (
                  <p>Filtres actifs : effacez-les pour revoir tout le catalogue.</p>
                ) : (
                  <p>Astuce : utilisez le filtre par type pour accélérer la recherche.</p>
                )}
                <p className="text-xs font-semibold text-amber-600">
                  Avertissement : la suppression supprime aussi les exemplaires liés.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {hasFilters && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setTypeFilter("");
                    }}
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
                  >
                    Réinitialiser les filtres
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white"
                >
                  Ajouter un ouvrage
                </button>
              </div>
            </div>
          }
        >
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full max-w-xs rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Rechercher..."
            />
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Tous les types</option>
              <option value="LIVRE">Livre</option>
              <option value="DVD">DVD</option>
              <option value="RESSOURCE_NUMERIQUE">Ressource numérique</option>
            </select>
          </div>
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-slate-400">
              <tr>
                <th className="py-2">Titre</th>
                <th className="py-2">Auteur</th>
                <th className="py-2">ISBN</th>
                <th className="py-2">Disponibles</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ouvrages.map((ouvrage) => (
                <tr key={ouvrage.id} className="border-t border-slate-100">
                  <td className="py-3 text-slate-700">{ouvrage.titre}</td>
                  <td className="py-3 text-slate-600">{ouvrage.auteur}</td>
                  <td className="py-3 text-slate-600">{ouvrage.isbn}</td>
                  <td className="py-3 text-slate-600">{ouvrage.exemplaires_disponibles}</td>
                  <td className="py-3 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(ouvrage)}
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(ouvrage)}
                      title="Supprimer cet ouvrage"
                      className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && ouvrages.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center">
                    <div className="flex flex-col items-center gap-3 text-sm text-slate-500">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                        <SearchX className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">Aucun résultat</p>
                        <p>Modifiez votre recherche ou ajoutez un nouvel ouvrage.</p>
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSearch("");
                            setTypeFilter("");
                          }}
                          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
                        >
                          Réinitialiser les filtres
                        </button>
                        <button
                          type="button"
                          onClick={() => setOpen(true)}
                          className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white"
                        >
                          Ajouter un ouvrage
                        </button>
                      </div>
                    </div>
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
                onClick={() => {
                  const prev = pagination.page - 1;
                  if (prev >= 1) {
                    api
                      .get("/api/catalogue/ouvrages/", {
                        params: { page: prev, search: search || undefined, type_ressource: typeFilter || undefined },
                      })
                      .then((res) => {
                        setOuvrages(res.data.results || []);
                        setPagination(res.data.pagination || { page: prev, pages: pagination.pages });
                      });
                  }
                }}
                disabled={pagination.page <= 1}
                className="rounded-lg border border-slate-200 px-3 py-1 disabled:opacity-50"
              >
                Précédent
              </button>
              <button
                type="button"
                onClick={() => {
                  const next = pagination.page + 1;
                  if (next <= pagination.pages) {
                    api
                      .get("/api/catalogue/ouvrages/", {
                        params: { page: next, search: search || undefined, type_ressource: typeFilter || undefined },
                      })
                      .then((res) => {
                        setOuvrages(res.data.results || []);
                        setPagination(res.data.pagination || { page: next, pages: pagination.pages });
                      });
                  }
                }}
                disabled={pagination.page >= pagination.pages}
                className="rounded-lg border border-slate-200 px-3 py-1 disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          </div>
        </TableCard>

        <Modal open={open} onClose={() => setOpen(false)} title="Ajouter un ouvrage">
          <form className="space-y-4" onSubmit={handleCreate}>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-slate-500">ISBN</label>
                <input
                  value={form.isbn}
                  onChange={(event) => setForm({ ...form, isbn: event.target.value })}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Titre</label>
                <input
                  value={form.titre}
                  onChange={(event) => setForm({ ...form, titre: event.target.value })}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  required
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-slate-500">Auteur</label>
                <input
                  value={form.auteur}
                  onChange={(event) => setForm({ ...form, auteur: event.target.value })}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Éditeur</label>
                <input
                  value={form.editeur}
                  onChange={(event) => setForm({ ...form, editeur: event.target.value })}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-slate-500">Année</label>
                <input
                  type="number"
                  value={form.annee}
                  onChange={(event) => setForm({ ...form, annee: event.target.value })}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Catégorie</label>
                <input
                  value={form.categorie}
                  onChange={(event) => setForm({ ...form, categorie: event.target.value })}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  required
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-slate-500">Type ressource</label>
                <select
                  value={form.type_ressource}
                  onChange={(event) => setForm({ ...form, type_ressource: event.target.value })}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="LIVRE">Livre</option>
                  <option value="DVD">DVD</option>
                  <option value="RESSOURCE_NUMERIQUE">Ressource numérique</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Nombre d'exemplaires</label>
                <input
                  type="number"
                  value={form.nombre_exemplaires}
                  onChange={(event) => setForm({ ...form, nombre_exemplaires: event.target.value })}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Enregistrer l'ouvrage
            </button>
          </form>
        </Modal>

        <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Modifier un ouvrage">
          <form className="space-y-4" onSubmit={handleUpdate}>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-slate-500">ISBN</label>
                <input
                  value={editForm.isbn}
                  onChange={(event) => setEditForm({ ...editForm, isbn: event.target.value })}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Titre</label>
                <input
                  value={editForm.titre}
                  onChange={(event) => setEditForm({ ...editForm, titre: event.target.value })}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  required
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-slate-500">Auteur</label>
                <input
                  value={editForm.auteur}
                  onChange={(event) => setEditForm({ ...editForm, auteur: event.target.value })}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Éditeur</label>
                <input
                  value={editForm.editeur}
                  onChange={(event) => setEditForm({ ...editForm, editeur: event.target.value })}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-slate-500">Année</label>
                <input
                  type="number"
                  value={editForm.annee}
                  onChange={(event) => setEditForm({ ...editForm, annee: event.target.value })}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Catégorie</label>
                <input
                  value={editForm.categorie}
                  onChange={(event) => setEditForm({ ...editForm, categorie: event.target.value })}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  required
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-slate-500">Type ressource</label>
                <select
                  value={editForm.type_ressource}
                  onChange={(event) => setEditForm({ ...editForm, type_ressource: event.target.value })}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="LIVRE">Livre</option>
                  <option value="DVD">DVD</option>
                  <option value="RESSOURCE_NUMERIQUE">Ressource numérique</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Disponible</label>
                <select
                  value={editForm.disponible ? "true" : "false"}
                  onChange={(event) =>
                    setEditForm({ ...editForm, disponible: event.target.value === "true" })
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="true">Oui</option>
                  <option value="false">Non</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Mettre à jour
            </button>
          </form>
        </Modal>
      </div>
    </RoleGuard>
  );
}
