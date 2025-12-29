"use client";

import { useEffect, useState } from "react";
import { BookOpen, ClipboardList, Timer } from "lucide-react";

import { StatCard } from "@/components/StatCard";
import { TableCard } from "@/components/TableCard";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { useRoleGuard } from "@/lib/guard";

type DashboardStats = {
  resume: {
    nb_emprunts_total: number;
    nb_emprunts_en_retard: number;
    nb_penalites_impayees: number;
  };
};

type Retard = {
  id: number;
  ouvrage_titre: string;
  adherent_username: string;
  date_retour_prevue: string;
  jours_retard: number;
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

type Emprunt = {
  id: number;
  ouvrage_titre: string;
  exemplaire_code: string;
  adherent_username: string;
};

export default function BibliothecaireDashboardPage() {
  useRoleGuard(["BIBLIOTHECAIRE"]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [retards, setRetards] = useState<Retard[]>([]);
  const [adherents, setAdherents] = useState<Adherent[]>([]);
  const [exemplaires, setExemplaires] = useState<Exemplaire[]>([]);
  const [empruntsEnCours, setEmpruntsEnCours] = useState<Emprunt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState({ adherentId: "", exemplaireId: "" });
  const [retourForm, setRetourForm] = useState({ empruntId: "" });

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, retardsRes, adherentsRes, exemplairesRes, empruntsRes] = await Promise.all([
        api.get<DashboardStats>("/api/dashboard/stats/"),
        api.get<{ results: Retard[] }>("/api/emprunts/retards/?page_size=5"),
        api.get<Adherent[]>("/api/adherents/"),
        api.get<{ results: Exemplaire[] }>("/api/catalogue/exemplaires-disponibles/?page_size=30"),
        api.get<{ results: Emprunt[] }>("/api/emprunts/en-cours/?page_size=30"),
      ]);
      setStats(statsRes.data);
      setRetards(retardsRes.data.results);
      setAdherents(adherentsRes.data);
      setExemplaires(exemplairesRes.data.results);
      setEmpruntsEnCours(empruntsRes.data.results);
    } catch {
      setError("Impossible de charger les données.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateEmprunt = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!createForm.adherentId || !createForm.exemplaireId) {
      setError("Sélectionnez un lecteur et un exemplaire.");
      return;
    }
    try {
      await api.post("/api/emprunts/creer/", {
        adherent_id: Number(createForm.adherentId),
        exemplaire_id: Number(createForm.exemplaireId),
      });
      setCreateForm({ adherentId: "", exemplaireId: "" });
      loadData();
    } catch {
      setError("Création d'emprunt impossible.");
    }
  };

  const handleRetour = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!retourForm.empruntId) {
      setError("Sélectionnez un emprunt.");
      return;
    }
    try {
      await api.post(`/api/emprunts/${retourForm.empruntId}/retour/`);
      setRetourForm({ empruntId: "" });
      loadData();
    } catch {
      setError("Retour impossible.");
    }
  };

  return (
    <div className="space-y-6">
      {error ? <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</div> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Emprunts totaux" value={stats?.resume.nb_emprunts_total ?? "-"} icon={BookOpen} />
        <StatCard label="Retards" value={stats?.resume.nb_emprunts_en_retard ?? "-"} icon={Timer} tone="amber" />
        <StatCard
          label="Pénalités impayées"
          value={stats?.resume.nb_penalites_impayees ?? "-"}
          icon={ClipboardList}
          tone="rose"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TableCard title="Créer un emprunt">
          <form className="space-y-4" onSubmit={handleCreateEmprunt}>
            <label className="text-sm text-slate-600">
              Lecteur
              <select
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                value={createForm.adherentId}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, adherentId: event.target.value }))}
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
                value={createForm.exemplaireId}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, exemplaireId: event.target.value }))}
              >
                <option value="">Sélectionner un exemplaire</option>
                {exemplaires.map((exemplaire) => (
                  <option key={exemplaire.id} value={exemplaire.id}>
                    {exemplaire.ouvrage_titre} - {exemplaire.code_barre}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className="rounded-xl bg-brand-600 px-4 py-2 text-sm text-white">
              Enregistrer l'emprunt
            </button>
          </form>
        </TableCard>

        <TableCard title="Retour d'emprunt">
          <form className="space-y-4" onSubmit={handleRetour}>
            <label className="text-sm text-slate-600">
              Emprunt en cours
              <select
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                value={retourForm.empruntId}
                onChange={(event) => setRetourForm({ empruntId: event.target.value })}
              >
                <option value="">Sélectionner un emprunt</option>
                {empruntsEnCours.map((emprunt) => (
                  <option key={emprunt.id} value={emprunt.id}>
                    {emprunt.ouvrage_titre} - {emprunt.adherent_username}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className="rounded-xl bg-brand-600 px-4 py-2 text-sm text-white">
              Enregistrer le retour
            </button>
          </form>
        </TableCard>
      </div>

      <TableCard title="Emprunts en retard">
        {loading ? (
          <p className="text-sm text-slate-500">Chargement des retards...</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-slate-400">
                <th className="py-2">Ouvrage</th>
                <th>Lecteur</th>
                <th>Retour prévu</th>
                <th>Jours retard</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {retards.map((retard) => (
                <tr key={retard.id} className="text-slate-600">
                  <td className="py-3 font-medium text-slate-700">{retard.ouvrage_titre}</td>
                  <td>{retard.adherent_username}</td>
                  <td>{formatDate(retard.date_retour_prevue)}</td>
                  <td>{retard.jours_retard}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableCard>
    </div>
  );
}
