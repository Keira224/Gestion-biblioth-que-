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
      const response = await api.get("/api/demandes-livres/me/");
      setDemandes(response.data.results || []);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Impossible de charger vos demandes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemandes();
  }, []);

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
