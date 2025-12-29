"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { Modal } from "@/components/Modal";
import { TableCard } from "@/components/TableCard";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { useRoleGuard } from "@/lib/guard";

type Emprunt = {
  id: number;
  ouvrage_titre: string;
  exemplaire_code: string;
  adherent_username: string;
  date_emprunt: string;
  date_retour_prevue: string;
  statut: string;
};

type Adherent = {
  id: number;
  username: string;
  nom: string;
  prenom: string;
};

type Exemplaire = {
  id: number;
  code_barre: string;
  ouvrage_titre: string;
};

export default function AdminEmpruntsPage() {
  useRoleGuard(["ADMIN"]);
  const [emprunts, setEmprunts] = useState<Emprunt[]>([]);
  const [adherents, setAdherents] = useState<Adherent[]>([]);
  const [exemplaires, setExemplaires] = useState<Exemplaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ adherentId: "", exemplaireId: "" });

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [empruntsRes, adherentsRes, exemplairesRes] = await Promise.all([
        api.get<{ results: Emprunt[] }>("/api/emprunts/historique/?page_size=20"),
        api.get<Adherent[]>("/api/adherents/"),
        api.get<{ results: Exemplaire[] }>("/api/catalogue/exemplaires-disponibles/?page_size=50"),
      ]);
      setEmprunts(empruntsRes.data.results);
      setAdherents(adherentsRes.data);
      setExemplaires(exemplairesRes.data.results);
    } catch {
      setError("Impossible de charger les emprunts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.adherentId || !form.exemplaireId) {
      setError("Veuillez sélectionner un lecteur et un exemplaire.");
      return;
    }

    try {
      await api.post("/api/emprunts/creer/", {
        adherent_id: Number(form.adherentId),
        exemplaire_id: Number(form.exemplaireId),
      });
      setOpen(false);
      setForm({ adherentId: "", exemplaireId: "" });
      loadData();
    } catch {
      setError("Création d'emprunt impossible.");
    }
  };

  return (
    <div className="space-y-6">
      {error ? <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</div> : null}

      <TableCard
        title="Historique des emprunts"
        action={
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm text-white"
          >
            <Plus className="h-4 w-4" />
            Créer emprunt
          </button>
        }
      >
        {loading ? (
          <p className="text-sm text-slate-500">Chargement des emprunts...</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-slate-400">
                <th className="py-2">Ouvrage</th>
                <th>Exemplaire</th>
                <th>Lecteur</th>
                <th>Emprunt</th>
                <th>Retour prévu</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {emprunts.map((emprunt) => (
                <tr key={emprunt.id} className="text-slate-600">
                  <td className="py-3 font-medium text-slate-700">{emprunt.ouvrage_titre}</td>
                  <td>{emprunt.exemplaire_code}</td>
                  <td>{emprunt.adherent_username}</td>
                  <td>{formatDate(emprunt.date_emprunt)}</td>
                  <td>{formatDate(emprunt.date_retour_prevue)}</td>
                  <td>{emprunt.statut}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableCard>

      <Modal title="Créer un emprunt" open={open} onClose={() => setOpen(false)}>
        <form className="space-y-4" onSubmit={handleCreate}>
          <label className="text-sm text-slate-600">
            Lecteur
            <select
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              value={form.adherentId}
              onChange={(event) => setForm((prev) => ({ ...prev, adherentId: event.target.value }))}
            >
              <option value="">Sélectionner un lecteur</option>
              {adherents.map((adherent) => (
                <option key={adherent.id} value={adherent.id}>
                  {adherent.prenom} {adherent.nom} ({adherent.username})
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-slate-600">
            Exemplaire disponible
            <select
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              value={form.exemplaireId}
              onChange={(event) => setForm((prev) => ({ ...prev, exemplaireId: event.target.value }))}
            >
              <option value="">Sélectionner un exemplaire</option>
              {exemplaires.map((exemplaire) => (
                <option key={exemplaire.id} value={exemplaire.id}>
                  {exemplaire.ouvrage_titre} - {exemplaire.code_barre}
                </option>
              ))}
            </select>
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
