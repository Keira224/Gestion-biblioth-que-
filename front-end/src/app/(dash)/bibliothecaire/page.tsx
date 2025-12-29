"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, ClipboardList, Users, Wallet } from "lucide-react";
import { api } from "../../../lib/api";
import { RoleGuard } from "../../../components/RoleGuard";
import { StatCard } from "../../../components/StatCard";
import { TableCard } from "../../../components/TableCard";
import { Modal } from "../../../components/Modal";
import { formatDate } from "../../../lib/format";

export default function BibliothecaireDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [retards, setRetards] = useState<any[]>([]);
  const [empruntsEnCours, setEmpruntsEnCours] = useState<any[]>([]);
  const [adherents, setAdherents] = useState<any[]>([]);
  const [exemplaires, setExemplaires] = useState<any[]>([]);
  const [openEmprunt, setOpenEmprunt] = useState(false);
  const [openRetour, setOpenRetour] = useState(false);
  const [form, setForm] = useState({ adherentId: "", exemplaireId: "" });
  const [retourId, setRetourId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, retardsRes, empruntsRes, adherentsRes, exemplairesRes] = await Promise.all([
        api.get("/api/dashboard/stats/"),
        api.get("/api/emprunts/retards/"),
        api.get("/api/emprunts/en-cours/"),
        api.get("/api/adherents/"),
        api.get("/api/catalogue/exemplaires-disponibles/"),
      ]);
      setStats(statsRes.data);
      setRetards(retardsRes.data.results || []);
      setEmpruntsEnCours(empruntsRes.data.results || []);
      setAdherents(adherentsRes.data.results || []);
      setExemplaires(exemplairesRes.data.results || []);
      if (!form.adherentId && adherentsRes.data.results?.length) {
        setForm((prev) => ({ ...prev, adherentId: String(adherentsRes.data.results[0].id) }));
      }
      if (!form.exemplaireId && exemplairesRes.data.results?.length) {
        setForm((prev) => ({ ...prev, exemplaireId: String(exemplairesRes.data.results[0].id) }));
      }
      if (!retourId && empruntsRes.data.results?.length) {
        setRetourId(String(empruntsRes.data.results[0].id));
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Impossible de charger le tableau de bord.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCreerEmprunt = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    try {
      await api.post("/api/emprunts/creer/", {
        adherent_id: Number(form.adherentId),
        exemplaire_id: Number(form.exemplaireId),
      });
      setOpenEmprunt(false);
      await fetchDashboard();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Création d'emprunt impossible.");
    }
  };

  const handleRetour = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!retourId) return;
    setError(null);
    try {
      await api.post(`/api/emprunts/${retourId}/retour/`);
      setOpenRetour(false);
      await fetchDashboard();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Retour impossible.");
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

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Emprunts totaux"
            value={stats?.resume?.nb_emprunts_total ?? (loading ? "..." : 0)}
            icon={<ClipboardList className="h-5 w-5" />}
          />
          <StatCard
            title="Emprunts en retard"
            value={stats?.resume?.nb_emprunts_en_retard ?? (loading ? "..." : 0)}
            icon={<AlertTriangle className="h-5 w-5" />}
          />
          <StatCard
            title="Pénalités impayées"
            value={stats?.resume?.nb_penalites_impayees ?? (loading ? "..." : 0)}
            icon={<Wallet className="h-5 w-5" />}
          />
          <StatCard
            title="Adhérents"
            value={adherents.length}
            icon={<Users className="h-5 w-5" />}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
          <TableCard
            title="Emprunts en retard"
            action={
              <button
                type="button"
                onClick={() => setOpenEmprunt(true)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
              >
                + Créer emprunt
              </button>
            }
          >
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-slate-400">
                <tr>
                  <th className="py-2">Lecteur</th>
                  <th className="py-2">Ouvrage</th>
                  <th className="py-2">Retard</th>
                  <th className="py-2">Date prévue</th>
                </tr>
              </thead>
              <tbody>
                {retards.map((retard) => (
                  <tr key={retard.id} className="border-t border-slate-100">
                    <td className="py-3 text-slate-700">{retard.adherent_username}</td>
                    <td className="py-3 text-slate-600">{retard.ouvrage_titre}</td>
                    <td className="py-3 text-slate-600">{retard.jours_retard} j</td>
                    <td className="py-3 text-slate-600">{formatDate(retard.date_retour_prevue)}</td>
                  </tr>
                ))}
                {!loading && retards.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-sm text-slate-400">
                      Aucun retard à afficher.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </TableCard>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800">Opérations rapides</h3>
              <p className="mt-1 text-sm text-slate-500">Créer un emprunt ou enregistrer un retour.</p>
              <div className="mt-4 space-y-3">
                <button
                  type="button"
                  onClick={() => setOpenEmprunt(true)}
                  className="w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  Créer emprunt
                </button>
                <button
                  type="button"
                  onClick={() => setOpenRetour(true)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
                >
                  Enregistrer retour
                </button>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800">Emprunts en cours</h3>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                {empruntsEnCours.slice(0, 4).map((emprunt) => (
                  <div key={emprunt.id} className="rounded-xl bg-slate-50 px-3 py-2">
                    {emprunt.ouvrage_titre} · {emprunt.adherent_username}
                  </div>
                ))}
                {!loading && empruntsEnCours.length === 0 && (
                  <p className="text-slate-400">Aucun emprunt en cours.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <Modal open={openEmprunt} onClose={() => setOpenEmprunt(false)} title="Créer un emprunt">
          <form className="space-y-4" onSubmit={handleCreerEmprunt}>
            <div>
              <label className="text-xs font-semibold text-slate-500">Adhérent</label>
              <select
                value={form.adherentId}
                onChange={(event) => setForm({ ...form, adherentId: event.target.value })}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                required
              >
                {adherents.map((adherent) => (
                  <option key={adherent.id} value={adherent.id}>
                    {adherent.prenom} {adherent.nom} ({adherent.username})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Exemplaire disponible</label>
              <select
                value={form.exemplaireId}
                onChange={(event) => setForm({ ...form, exemplaireId: event.target.value })}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                required
              >
                {exemplaires.map((exemplaire) => (
                  <option key={exemplaire.id} value={exemplaire.id}>
                    {exemplaire.ouvrage_titre} · {exemplaire.code_barre}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Créer emprunt
            </button>
          </form>
        </Modal>

        <Modal open={openRetour} onClose={() => setOpenRetour(false)} title="Enregistrer un retour">
          <form className="space-y-4" onSubmit={handleRetour}>
            <div>
              <label className="text-xs font-semibold text-slate-500">Emprunt en cours</label>
              <select
                value={retourId}
                onChange={(event) => setRetourId(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                required
              >
                {empruntsEnCours.map((emprunt) => (
                  <option key={emprunt.id} value={emprunt.id}>
                    {emprunt.ouvrage_titre} · {emprunt.adherent_username}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Enregistrer retour
            </button>
          </form>
        </Modal>
      </div>
    </RoleGuard>
  );
}
