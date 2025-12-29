"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { api } from "../../../../lib/api";
import { RoleGuard } from "../../../../components/RoleGuard";
import { TableCard } from "../../../../components/TableCard";
import { Modal } from "../../../../components/Modal";

export default function AdminOuvragesPage() {
  const [ouvrages, setOuvrages] = useState<any[]>([]);
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
    nombre_exemplaires: "",
  });

  const fetchOuvrages = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/catalogue/ouvrages/");
      setOuvrages(response.data.results || []);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Impossible de charger les ouvrages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOuvrages();
  }, []);

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
      await fetchOuvrages();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Création impossible.");
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
        >
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-slate-400">
              <tr>
                <th className="py-2">Titre</th>
                <th className="py-2">Auteur</th>
                <th className="py-2">Catégorie</th>
                <th className="py-2">Exemplaires</th>
                <th className="py-2">Disponibles</th>
              </tr>
            </thead>
            <tbody>
              {ouvrages.map((ouvrage) => (
                <tr key={ouvrage.id} className="border-t border-slate-100">
                  <td className="py-3 font-medium text-slate-700">{ouvrage.titre}</td>
                  <td className="py-3 text-slate-600">{ouvrage.auteur}</td>
                  <td className="py-3 text-slate-600">{ouvrage.categorie}</td>
                  <td className="py-3 text-slate-600">{ouvrage.exemplaires_total}</td>
                  <td className="py-3 text-slate-600">{ouvrage.exemplaires_disponibles}</td>
                </tr>
              ))}
              {!loading && ouvrages.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-sm text-slate-400">
                    Aucun ouvrage enregistré.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
                  <option value="MAGAZINE">Magazine</option>
                  <option value="THESE">Thèse</option>
                  <option value="CD">CD</option>
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
      </div>
    </RoleGuard>
  );
}
