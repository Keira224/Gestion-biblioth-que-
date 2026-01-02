"use client";

import { useEffect, useState } from "react";
import { api } from "../../../../lib/api";
import { RoleGuard } from "../../../../components/RoleGuard";
import { TableCard } from "../../../../components/TableCard";
import { formatDate } from "../../../../lib/format";

export default function BibliothecaireHistoriqueEmpruntsPage() {
  const [emprunts, setEmprunts] = useState<any[]>([]);
  const [adherents, setAdherents] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [searchOuvrage, setSearchOuvrage] = useState("");
  const [statutFilter, setStatutFilter] = useState("");
  const [adherentFilter, setAdherentFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdherents = async () => {
      try {
        const response = await api.get("/api/adherents/", { params: { page_size: 200 } });
        setAdherents(response.data.results || []);
      } catch (err: any) {
        setError(err?.response?.data?.detail || "Impossible de charger les adhérents.");
      }
    };
    fetchAdherents();
  }, []);

  useEffect(() => {
    const fetchHistorique = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get("/api/emprunts/historique/", {
          params: {
            page: pagination.page,
            search: searchOuvrage || undefined,
            statut: statutFilter || undefined,
            adherent_id: adherentFilter || undefined,
          },
        });
        setEmprunts(response.data.results || []);
        setPagination(response.data.pagination || { page: 1, pages: 1 });
      } catch (err: any) {
        setError(err?.response?.data?.detail || "Impossible de charger l'historique.");
      } finally {
        setLoading(false);
      }
    };
    fetchHistorique();
  }, [pagination.page, searchOuvrage, statutFilter, adherentFilter]);

  return (
    <RoleGuard allowed={["BIBLIOTHECAIRE"]}>
      <div className="space-y-6">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <TableCard title="Historique des emprunts">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <input
              value={searchOuvrage}
              onChange={(event) => {
                setPagination((prev) => ({ ...prev, page: 1 }));
                setSearchOuvrage(event.target.value);
              }}
              className="w-full max-w-xs rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Rechercher un ouvrage..."
            />
            <select
              value={adherentFilter}
              onChange={(event) => {
                setPagination((prev) => ({ ...prev, page: 1 }));
                setAdherentFilter(event.target.value);
              }}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Tous les lecteurs</option>
              {adherents.map((adherent) => (
                <option key={adherent.id} value={adherent.id}>
                  {adherent.prenom} {adherent.nom} ({adherent.username})
                </option>
              ))}
            </select>
            <select
              value={statutFilter}
              onChange={(event) => {
                setPagination((prev) => ({ ...prev, page: 1 }));
                setStatutFilter(event.target.value);
              }}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Tous les statuts</option>
              <option value="EN_COURS">En cours</option>
              <option value="EN_RETARD">En retard</option>
              <option value="RETOURNE">Retourné</option>
            </select>
          </div>
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-slate-400">
              <tr>
                <th className="py-2">Lecteur</th>
                <th className="py-2">Ouvrage</th>
                <th className="py-2">Statut</th>
                <th className="py-2">Date emprunt</th>
                <th className="py-2">Retour prévu</th>
                <th className="py-2">Retour effectif</th>
              </tr>
            </thead>
            <tbody>
              {emprunts.map((emprunt) => (
                <tr key={emprunt.id} className="border-t border-slate-100">
                  <td className="py-3 text-slate-700">{emprunt.adherent_username}</td>
                  <td className="py-3 text-slate-600">{emprunt.ouvrage_titre}</td>
                  <td className="py-3 text-slate-600">{emprunt.statut}</td>
                  <td className="py-3 text-slate-600">{formatDate(emprunt.date_emprunt)}</td>
                  <td className="py-3 text-slate-600">{formatDate(emprunt.date_retour_prevue)}</td>
                  <td className="py-3 text-slate-600">{formatDate(emprunt.date_retour_effective)}</td>
                </tr>
              ))}
              {!loading && emprunts.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-sm text-slate-400">
                    Aucun emprunt à afficher.
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
      </div>
    </RoleGuard>
  );
}
