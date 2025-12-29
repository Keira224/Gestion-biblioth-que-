"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { Modal } from "@/components/Modal";
import { TableCard } from "@/components/TableCard";
import { api } from "@/lib/api";
import { useRoleGuard } from "@/lib/guard";

type Exemplaire = {
  id: number;
  code_barre: string;
  etat: string;
  ouvrage_titre: string;
  ouvrage_auteur: string;
};

type OuvrageOption = {
  id: number;
  titre: string;
};

export default function AdminExemplairesPage() {
  useRoleGuard(["ADMIN"]);
  const [exemplaires, setExemplaires] = useState<Exemplaire[]>([]);
  const [ouvrages, setOuvrages] = useState<OuvrageOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ouvrageId: "", nombre: "1" });

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [exemplairesRes, ouvragesRes] = await Promise.all([
        api.get<{ results: Exemplaire[] }>("/api/catalogue/exemplaires-disponibles/?page_size=20"),
        api.get<{ results: OuvrageOption[] }>("/api/catalogue/ouvrages/?page_size=50"),
      ]);
      setExemplaires(exemplairesRes.data.results);
      setOuvrages(ouvragesRes.data.results);
    } catch {
      setError("Impossible de charger les exemplaires.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.ouvrageId) {
      setError("Veuillez sélectionner un ouvrage.");
      return;
    }

    try {
      await api.post(`/api/catalogue/ouvrages/${form.ouvrageId}/exemplaires/`, {
        nombre: Number(form.nombre) || 1,
      });
      setOpen(false);
      setForm({ ouvrageId: "", nombre: "1" });
      loadData();
    } catch {
      setError("Ajout d'exemplaire impossible.");
    }
  };

  return (
    <div className="space-y-6">
      {error ? <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</div> : null}

      <TableCard
        title="Exemplaires disponibles"
        action={
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm text-white"
          >
            <Plus className="h-4 w-4" />
            Ajouter exemplaire
          </button>
        }
      >
        {loading ? (
          <p className="text-sm text-slate-500">Chargement des exemplaires...</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-slate-400">
                <th className="py-2">Code barre</th>
                <th>Ouvrage</th>
                <th>Auteur</th>
                <th>État</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {exemplaires.map((exemplaire) => (
                <tr key={exemplaire.id} className="text-slate-600">
                  <td className="py-3 font-medium text-slate-700">{exemplaire.code_barre}</td>
                  <td>{exemplaire.ouvrage_titre}</td>
                  <td>{exemplaire.ouvrage_auteur}</td>
                  <td>{exemplaire.etat}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableCard>

      <Modal title="Ajouter des exemplaires" open={open} onClose={() => setOpen(false)}>
        <form className="space-y-4" onSubmit={handleCreate}>
          <label className="text-sm text-slate-600">
            Ouvrage
            <select
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              value={form.ouvrageId}
              onChange={(event) => setForm((prev) => ({ ...prev, ouvrageId: event.target.value }))}
              required
            >
              <option value="">Sélectionner un ouvrage</option>
              {ouvrages.map((ouvrage) => (
                <option key={ouvrage.id} value={ouvrage.id}>
                  {ouvrage.titre}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-slate-600">
            Nombre d'exemplaires
            <input
              type="number"
              min={1}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              value={form.nombre}
              onChange={(event) => setForm((prev) => ({ ...prev, nombre: event.target.value }))}
            />
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
              Ajouter
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
