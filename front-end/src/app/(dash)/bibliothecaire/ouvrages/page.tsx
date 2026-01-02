"use client";

import { useEffect, useState } from "react";
import { BookOpen, Plus } from "lucide-react";
import { api } from "../../../../lib/api";
import { RoleGuard } from "../../../../components/RoleGuard";
import { TableCard } from "../../../../components/TableCard";
import { Modal } from "../../../../components/Modal";

export default function BibliothecaireOuvragesPage() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
  const getImageUrl = (value?: string | null) => {
    if (!value) return undefined;
    if (value.startsWith("/media")) {
      return `${apiBase}${value}`;
    }
    return value;
  };
  const [ouvrages, setOuvrages] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [search, setSearch] = useState("");
  const [titreFilter, setTitreFilter] = useState("");
  const [auteurFilter, setAuteurFilter] = useState("");
  const [isbnFilter, setIsbnFilter] = useState("");
  const [categorieFilter, setCategorieFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [disponibleFilter, setDisponibleFilter] = useState("");
  const [ordering, setOrdering] = useState("titre");
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
          titre: titreFilter || undefined,
          auteur: auteurFilter || undefined,
          isbn: isbnFilter || undefined,
          categorie: categorieFilter || undefined,
          type_ressource: typeFilter || undefined,
          disponible: disponibleFilter || undefined,
          ordering: ordering || undefined,
        },
      });
      setOuvrages(response.data.results || []);
      setPagination(response.data.pagination || { page: 1, pages: 1 });
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Impossible de charger le catalogue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOuvrages(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, titreFilter, auteurFilter, isbnFilter, categorieFilter, typeFilter, disponibleFilter, ordering]);

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
      setError(err?.response?.data?.detail || "Création impossible.");
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
      setError(err?.response?.data?.detail || "Modification impossible.");
    }
  };

  const handleDelete = async (ouvrageId: number) => {
    if (!confirm("Supprimer cet ouvrage ?")) return;
    setError(null);
    try {
      await api.delete(`/api/catalogue/ouvrages/${ouvrageId}/`);
      await fetchOuvrages(pagination.page);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Suppression impossible.");
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
        >
          <div className="mb-4 grid gap-3 lg:grid-cols-6">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Recherche globale..."
            />
            <input
              value={titreFilter}
              onChange={(event) => setTitreFilter(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Titre"
            />
            <input
              value={auteurFilter}
              onChange={(event) => setAuteurFilter(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Auteur"
            />
            <input
              value={isbnFilter}
              onChange={(event) => setIsbnFilter(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="ISBN"
            />
            <input
              value={categorieFilter}
              onChange={(event) => setCategorieFilter(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Catégorie"
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
            <select
              value={disponibleFilter}
              onChange={(event) => setDisponibleFilter(event.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Disponibilité</option>
              <option value="true">Disponible</option>
              <option value="false">Indisponible</option>
            </select>
            <select
              value={ordering}
              onChange={(event) => setOrdering(event.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="titre">Titre (A-Z)</option>
              <option value="-titre">Titre (Z-A)</option>
              <option value="auteur">Auteur (A-Z)</option>
              <option value="-auteur">Auteur (Z-A)</option>
              <option value="isbn">ISBN (A-Z)</option>
              <option value="-isbn">ISBN (Z-A)</option>
              <option value="categorie">Catégorie (A-Z)</option>
              <option value="-categorie">Catégorie (Z-A)</option>
            </select>
          </div>
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-slate-400">
              <tr>
                <th className="py-2">Aperçu</th>
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
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-9 items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-slate-400">
                        {getImageUrl(ouvrage.image) ? (
                          <img
                            src={getImageUrl(ouvrage.image)}
                            alt={ouvrage.titre}
                            className="h-full w-full object-cover"
                          />
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
                      onClick={() => handleDelete(ouvrage.id)}
                      className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && ouvrages.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-sm text-slate-400">
                    Aucun ouvrage.
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
                  if (prev >= 1) fetchOuvrages(prev);
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
                  if (next <= pagination.pages) fetchOuvrages(next);
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
            {/* ... identique à la version admin (mêmes champs) ... */}
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
            {/* ... identique à la version admin (mêmes champs) ... */}
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
