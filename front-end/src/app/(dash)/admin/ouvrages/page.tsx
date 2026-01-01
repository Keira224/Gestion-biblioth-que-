"use client";

import { useEffect, useState } from "react";
<<<<<<< HEAD
import { Plus, SearchX } from "lucide-react";
=======
import { BookOpen, Plus } from "lucide-react";
>>>>>>> codex-verify
import { api } from "../../../../lib/api";
import { RoleGuard } from "../../../../components/RoleGuard";
import { TableCard } from "../../../../components/TableCard";
import { Modal } from "../../../../components/Modal";
import { formatApiError } from "../../../../lib/format";

export default function AdminOuvragesPage() {
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
    description_courte: "",
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
    description_courte: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);

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
      setError(formatApiError(err, "Impossible de charger les ouvrages."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOuvrages(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, typeFilter]);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    try {
      const payload = new FormData();
      payload.append("isbn", form.isbn);
      payload.append("titre", form.titre);
      payload.append("auteur", form.auteur);
      if (form.editeur) payload.append("editeur", form.editeur);
      if (form.annee) payload.append("annee", String(Number(form.annee)));
      payload.append("categorie", form.categorie);
      payload.append("type_ressource", form.type_ressource);
      payload.append("nombre_exemplaires", String(form.nombre_exemplaires ? Number(form.nombre_exemplaires) : 0));
      if (form.description_courte) payload.append("description_courte", form.description_courte);
      if (imageFile) payload.append("image", imageFile);

      await api.post("/api/catalogue/ouvrages/", payload, {
        headers: { "Content-Type": "multipart/form-data" },
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
        description_courte: "",
      });
      setImageFile(null);
      await fetchOuvrages(pagination.page);
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
      description_courte: ouvrage.description_courte || "",
    });
    setEditImageFile(null);
    setEditOpen(true);
  };

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedId) return;
    setError(null);
    try {
      const payload = new FormData();
      payload.append("isbn", editForm.isbn);
      payload.append("titre", editForm.titre);
      payload.append("auteur", editForm.auteur);
      if (editForm.editeur) payload.append("editeur", editForm.editeur);
      if (editForm.annee) payload.append("annee", String(Number(editForm.annee)));
      payload.append("categorie", editForm.categorie);
      payload.append("type_ressource", editForm.type_ressource);
      payload.append("disponible", String(editForm.disponible));
      if (editForm.description_courte) payload.append("description_courte", editForm.description_courte);
      if (editImageFile) payload.append("image", editImageFile);

      await api.patch(`/api/catalogue/ouvrages/${selectedId}/`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setEditOpen(false);
      await fetchOuvrages(pagination.page);
    } catch (err: any) {
      setError(formatApiError(err, "Modification impossible."));
    }
  };

  const handleDelete = async (ouvrage: any) => {
    const confirmed = confirm(
      `Vous supprimez l'ouvrage "${ouvrage.titre}" (${ouvrage.exemplaires_total} exemplaires au total). Continuer ?`,
    );
    if (!confirmed) return;
    setError(null);
    try {
      await api.delete(`/api/catalogue/ouvrages/${ouvrage.id}/`);
      await fetchOuvrages(pagination.page);
    } catch (err: any) {
      setError(formatApiError(err, "Suppression impossible."));
    }
  };

  const hasFilters = Boolean(search || typeFilter);

  return (
    <RoleGuard allowed={["ADMIN"]}>
      <div className="space-y-6">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <TableCard
          title="Gestion des ouvrages"
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
                  <p>Filtres actifs : réinitialisez pour revoir l'ensemble du catalogue.</p>
                ) : (
                  <p>Astuce : utilisez la recherche ou le type pour retrouver un ouvrage rapidement.</p>
                )}
                <p className="text-xs font-semibold text-amber-600">
                  Avertissement : la suppression est définitive et retire tous les exemplaires.
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
                <th className="py-2">Aperçu</th>
                <th className="py-2">Titre</th>
                <th className="py-2">Auteur</th>
                <th className="py-2">Catégorie</th>
                <th className="py-2">Exemplaires</th>
                <th className="py-2">Disponibles</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ouvrages.map((ouvrage) => (
                <tr key={ouvrage.id} className="border-t border-slate-100">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-9 items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-slate-400">
                        {ouvrage.image ? (
                          <img src={ouvrage.image} alt={ouvrage.titre} className="h-full w-full object-cover" />
                        ) : (
                          <BookOpen className="h-4 w-4" />
                        )}
                      </div>
                      <div className="text-xs text-slate-500">
                        {ouvrage.description_courte
                          ? ouvrage.description_courte.length > 60
                            ? `${ouvrage.description_courte.slice(0, 60)}...`
                            : ouvrage.description_courte
                          : "Aucune description"}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 font-medium text-slate-700">{ouvrage.titre}</td>
                  <td className="py-3 text-slate-600">{ouvrage.auteur}</td>
                  <td className="py-3 text-slate-600">{ouvrage.categorie}</td>
                  <td className="py-3 text-slate-600">{ouvrage.exemplaires_total}</td>
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
<<<<<<< HEAD
                  <td colSpan={6} className="py-10 text-center">
                    <div className="flex flex-col items-center gap-3 text-sm text-slate-500">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                        <SearchX className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">Aucun résultat</p>
                        <p>Affinez vos filtres ou ajoutez un nouvel ouvrage.</p>
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
=======
                  <td colSpan={7} className="py-6 text-center text-sm text-slate-400">
                    Aucun ouvrage enregistré.
>>>>>>> codex-verify
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
                onClick={() => fetchOuvrages(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="rounded-lg border border-slate-200 px-3 py-1 disabled:opacity-50"
              >
                Précédent
              </button>
              <button
                type="button"
                onClick={() => fetchOuvrages(pagination.page + 1)}
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
            <div>
              <label className="text-xs font-semibold text-slate-500">Description courte</label>
              <textarea
                value={form.description_courte}
                onChange={(event) => setForm({ ...form, description_courte: event.target.value })}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                rows={3}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Image de couverture</label>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setImageFile(event.target.files?.[0] || null)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
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
            <div>
              <label className="text-xs font-semibold text-slate-500">Description courte</label>
              <textarea
                value={editForm.description_courte}
                onChange={(event) => setEditForm({ ...editForm, description_courte: event.target.value })}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                rows={3}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Image de couverture</label>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setEditImageFile(event.target.files?.[0] || null)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
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
