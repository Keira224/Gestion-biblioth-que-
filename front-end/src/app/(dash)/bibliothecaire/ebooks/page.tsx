"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { api } from "../../../../lib/api";
import { RoleGuard } from "../../../../components/RoleGuard";
import { TableCard } from "../../../../components/TableCard";
import { Modal } from "../../../../components/Modal";

export default function BibliothecaireEbooksPage() {
  const [ebooks, setEbooks] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [search, setSearch] = useState("");
  const [payantFilter, setPayantFilter] = useState("");
  const [ouvrages, setOuvrages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState({
    ouvrage: "",
    format: "PDF",
    taille: "",
    nom_fichier: "",
    est_payant: false,
    prix: "",
    url_fichier: "",
  });
  const [editForm, setEditForm] = useState({
    ouvrage: "",
    format: "PDF",
    taille: "",
    nom_fichier: "",
    est_payant: false,
    prix: "",
    url_fichier: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [editFile, setEditFile] = useState<File | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ebooksRes, ouvragesRes] = await Promise.all([
        api.get("/api/ebooks/", {
          params: {
            page: pagination.page,
            search: search || undefined,
            est_payant: payantFilter || undefined,
          },
        }),
        api.get("/api/catalogue/ouvrages/"),
      ]);
      setEbooks(ebooksRes.data.results || []);
      setPagination(ebooksRes.data.pagination || { page: 1, pages: 1 });
      setOuvrages(ouvragesRes.data.results || []);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Impossible de charger les e-books.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, search, payantFilter]);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    try {
      const payload = new FormData();
      if (form.ouvrage) payload.append("ouvrage", form.ouvrage);
      payload.append("format", form.format);
      if (form.taille) payload.append("taille", form.taille);
      payload.append("nom_fichier", form.nom_fichier);
      payload.append("est_payant", String(form.est_payant));
      if (form.est_payant && form.prix) payload.append("prix", form.prix);
      if (form.url_fichier) payload.append("url_fichier", form.url_fichier);
      if (file) payload.append("fichier", file);

      await api.post("/api/ebooks/", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setOpen(false);
      setForm({
        ouvrage: "",
        format: "PDF",
        taille: "",
        nom_fichier: "",
        est_payant: false,
        prix: "",
        url_fichier: "",
      });
      setFile(null);
      await fetchData();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Ajout impossible.");
    }
  };

  const openEditModal = (ebook: any) => {
    setSelectedId(ebook.id);
    setEditForm({
      ouvrage: ebook.ouvrage ? String(ebook.ouvrage) : "",
      format: ebook.format || "PDF",
      taille: ebook.taille ? String(ebook.taille) : "",
      nom_fichier: ebook.nom_fichier || "",
      est_payant: Boolean(ebook.est_payant),
      prix: ebook.prix ? String(ebook.prix) : "",
      url_fichier: ebook.url_fichier || "",
    });
    setEditFile(null);
    setEditOpen(true);
  };

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedId) return;
    setError(null);
    try {
      const payload = new FormData();
      if (editForm.ouvrage) payload.append("ouvrage", editForm.ouvrage);
      payload.append("format", editForm.format);
      if (editForm.taille) payload.append("taille", editForm.taille);
      payload.append("nom_fichier", editForm.nom_fichier);
      payload.append("est_payant", String(editForm.est_payant));
      if (editForm.est_payant && editForm.prix) payload.append("prix", editForm.prix);
      if (editForm.url_fichier) payload.append("url_fichier", editForm.url_fichier);
      if (editFile) payload.append("fichier", editFile);

      await api.patch(`/api/ebooks/${selectedId}/`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setEditOpen(false);
      await fetchData();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Modification impossible.");
    }
  };

  const handleDelete = async (ebookId: number) => {
    if (!confirm("Supprimer cet e-book ?")) return;
    setError(null);
    try {
      await api.delete(`/api/ebooks/${ebookId}/`);
      await fetchData();
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
          title="Gestion des e-books"
          action={
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" />
              Ajouter un e-book
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
              value={payantFilter}
              onChange={(event) => {
                setPagination((prev) => ({ ...prev, page: 1 }));
                setPayantFilter(event.target.value);
              }}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Tous</option>
              <option value="true">Payant</option>
              <option value="false">Gratuit</option>
            </select>
          </div>
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-slate-400">
              <tr>
                <th className="py-2">Nom</th>
                <th className="py-2">Format</th>
                <th className="py-2">Ouvrage</th>
                <th className="py-2">Payant</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ebooks.map((ebook) => (
                <tr key={ebook.id} className="border-t border-slate-100">
                  <td className="py-3 text-slate-700">{ebook.nom_fichier}</td>
                  <td className="py-3 text-slate-600">{ebook.format}</td>
                  <td className="py-3 text-slate-600">{ebook.ouvrage_titre || "-"}</td>
                  <td className="py-3 text-slate-600">{ebook.est_payant ? "Oui" : "Non"}</td>
                  <td className="py-3 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(ebook)}
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(ebook.id)}
                      className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && ebooks.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-sm text-slate-400">
                    Aucun e-book.
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

        <Modal open={open} onClose={() => setOpen(false)} title="Ajouter un e-book">
          <form className="space-y-4" onSubmit={handleCreate}>
            <div>
              <label className="text-xs font-semibold text-slate-500">Nom du fichier</label>
              <input
                value={form.nom_fichier}
                onChange={(event) => setForm({ ...form, nom_fichier: event.target.value })}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                required
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-slate-500">Format</label>
                <select
                  value={form.format}
                  onChange={(event) => setForm({ ...form, format: event.target.value })}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="PDF">PDF</option>
                  <option value="EPUB">EPUB</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Taille (Ko)</label>
                <input
                  type="number"
                  value={form.taille}
                  onChange={(event) => setForm({ ...form, taille: event.target.value })}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Lien du fichier</label>
              <input
                value={form.url_fichier}
                onChange={(event) => setForm({ ...form, url_fichier: event.target.value })}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Fichier e-book</label>
              <input
                type="file"
                onChange={(event) => setFile(event.target.files?.[0] || null)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Ouvrage associé</label>
              <select
                value={form.ouvrage}
                onChange={(event) => setForm({ ...form, ouvrage: event.target.value })}
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
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.est_payant}
                onChange={(event) => setForm({ ...form, est_payant: event.target.checked })}
              />
              <span className="text-sm text-slate-600">E-book payant</span>
            </div>
            {form.est_payant && (
              <div>
                <label className="text-xs font-semibold text-slate-500">Prix (GNF)</label>
                <input
                  type="number"
                  value={form.prix}
                  onChange={(event) => setForm({ ...form, prix: event.target.value })}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
            )}
            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Ajouter
            </button>
          </form>
        </Modal>

        <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Modifier un e-book">
          <form className="space-y-4" onSubmit={handleUpdate}>
            <div>
              <label className="text-xs font-semibold text-slate-500">Nom du fichier</label>
              <input
                value={editForm.nom_fichier}
                onChange={(event) => setEditForm({ ...editForm, nom_fichier: event.target.value })}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                required
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-slate-500">Format</label>
                <select
                  value={editForm.format}
                  onChange={(event) => setEditForm({ ...editForm, format: event.target.value })}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="PDF">PDF</option>
                  <option value="EPUB">EPUB</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Taille (Ko)</label>
                <input
                  type="number"
                  value={editForm.taille}
                  onChange={(event) => setEditForm({ ...editForm, taille: event.target.value })}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Lien du fichier</label>
              <input
                value={editForm.url_fichier}
                onChange={(event) => setEditForm({ ...editForm, url_fichier: event.target.value })}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Fichier e-book</label>
              <input
                type="file"
                onChange={(event) => setEditFile(event.target.files?.[0] || null)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Ouvrage associé</label>
              <select
                value={editForm.ouvrage}
                onChange={(event) => setEditForm({ ...editForm, ouvrage: event.target.value })}
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
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={editForm.est_payant}
                onChange={(event) => setEditForm({ ...editForm, est_payant: event.target.checked })}
              />
              <span className="text-sm text-slate-600">E-book payant</span>
            </div>
            {editForm.est_payant && (
              <div>
                <label className="text-xs font-semibold text-slate-500">Prix (GNF)</label>
                <input
                  type="number"
                  value={editForm.prix}
                  onChange={(event) => setEditForm({ ...editForm, prix: event.target.value })}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
            )}
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
