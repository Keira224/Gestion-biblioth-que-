"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { Modal } from "@/components/Modal";
import { TableCard } from "@/components/TableCard";
import { api } from "@/lib/api";
import { useRoleGuard } from "@/lib/guard";

const TYPE_OPTIONS = ["LIVRE", "MAGAZINE", "THESE", "NUMERIQUE"];

type Ouvrage = {
  id: number;
  isbn: string;
  titre: string;
  auteur: string;
  categorie: string;
  type_ressource: string;
  exemplaires_total: number;
  exemplaires_disponibles: number;
};

export default function AdminOuvragesPage() {
  useRoleGuard(["ADMIN"]);
  const [ouvrages, setOuvrages] = useState<Ouvrage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    isbn: "",
    titre: "",
    auteur: "",
    editeur: "",
    annee: "",
    categorie: "",
    type_ressource: "LIVRE",
    disponible: true,
    nombre_exemplaires: "1",
  });

  const loadOuvrages = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<{ results: Ouvrage[] }>("/api/catalogue/ouvrages/");
      setOuvrages(data.results);
    } catch {
      setError("Impossible de charger les ouvrages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOuvrages();
  }, []);

  const handleCreate = async (event: React.FormEvent) => {
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
        disponible: form.disponible,
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
        disponible: true,
        nombre_exemplaires: "1",
      });
      loadOuvrages();
    } catch {
      setError("Création ouvrage impossible. Vérifiez les champs.");
    }
  };

  return (
    <div className="space-y-6">
      {error ? <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</div> : null}

      <TableCard
        title="Catalogue des ouvrages"
        action={
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm text-white"
          >
            <Plus className="h-4 w-4" />
            Ajouter ouvrage
          </button>
        }
      >
        {loading ? (
          <p className="text-sm text-slate-500">Chargement des ouvrages...</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-slate-400">
                <th className="py-2">Titre</th>
                <th>Auteur</th>
                <th>Catégorie</th>
                <th>Type</th>
                <th>Exemplaires</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ouvrages.map((ouvrage) => (
                <tr key={ouvrage.id} className="text-slate-600">
                  <td className="py-3 font-medium text-slate-700">{ouvrage.titre}</td>
                  <td>{ouvrage.auteur}</td>
                  <td>{ouvrage.categorie}</td>
                  <td>{ouvrage.type_ressource}</td>
                  <td>
                    {ouvrage.exemplaires_disponibles}/{ouvrage.exemplaires_total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableCard>

      <Modal title="Ajouter un ouvrage" open={open} onClose={() => setOpen(false)}>
        <form className="space-y-4" onSubmit={handleCreate}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-slate-600">
              ISBN
              <input
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                value={form.isbn}
                onChange={(event) => setForm((prev) => ({ ...prev, isbn: event.target.value }))}
                required
              />
            </label>
            <label className="text-sm text-slate-600">
              Titre
              <input
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                value={form.titre}
                onChange={(event) => setForm((prev) => ({ ...prev, titre: event.target.value }))}
                required
              />
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-slate-600">
              Auteur
              <input
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                value={form.auteur}
                onChange={(event) => setForm((prev) => ({ ...prev, auteur: event.target.value }))}
                required
              />
            </label>
            <label className="text-sm text-slate-600">
              Catégorie
              <input
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                value={form.categorie}
                onChange={(event) => setForm((prev) => ({ ...prev, categorie: event.target.value }))}
                required
              />
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-slate-600">
              Éditeur
              <input
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                value={form.editeur}
                onChange={(event) => setForm((prev) => ({ ...prev, editeur: event.target.value }))}
              />
            </label>
            <label className="text-sm text-slate-600">
              Année
              <input
                type="number"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                value={form.annee}
                onChange={(event) => setForm((prev) => ({ ...prev, annee: event.target.value }))}
              />
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-slate-600">
              Type ressource
              <select
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                value={form.type_ressource}
                onChange={(event) => setForm((prev) => ({ ...prev, type_ressource: event.target.value }))}
              >
                {TYPE_OPTIONS.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm text-slate-600">
              Exemplaires à créer
              <input
                type="number"
                min={0}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                value={form.nombre_exemplaires}
                onChange={(event) => setForm((prev) => ({ ...prev, nombre_exemplaires: event.target.value }))}
              />
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={form.disponible}
              onChange={(event) => setForm((prev) => ({ ...prev, disponible: event.target.checked }))}
            />
            Disponible à l'emprunt
          </label>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm"
            >
              Annuler
            </button>
            <button type="submit" className="rounded-xl bg-brand-600 px-4 py-2 text-sm text-white">
              Enregistrer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
