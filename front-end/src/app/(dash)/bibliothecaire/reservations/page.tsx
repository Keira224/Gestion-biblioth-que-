"use client";

import { useEffect, useState } from "react";
import { api } from "../../../../lib/api";
import { RoleGuard } from "../../../../components/RoleGuard";
import { TableCard } from "../../../../components/TableCard";
import { formatDate, formatMoney } from "../../../../lib/format";

export default function BibliothecaireReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [search, setSearch] = useState("");
  const [statutFilter, setStatutFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReservations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/reservations/", {
        params: {
          page: pagination.page,
          search: search || undefined,
          statut: statutFilter || undefined,
        },
      });
      setReservations(response.data.results || []);
      setPagination(response.data.pagination || { page: 1, pages: 1 });
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Impossible de charger les réservations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [pagination.page, search, statutFilter]);

  const handleValider = async (reservationId: number) => {
    try {
      await api.post(`/api/reservations/${reservationId}/valider/`);
      await fetchReservations();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Impossible de valider la réservation.");
    }
  };

  const handleRefuser = async (reservationId: number) => {
    try {
      await api.post(`/api/reservations/${reservationId}/refuser/`);
      await fetchReservations();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Impossible de refuser la réservation.");
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

        <TableCard title="Réservations">
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
              value={statutFilter}
              onChange={(event) => {
                setPagination((prev) => ({ ...prev, page: 1 }));
                setStatutFilter(event.target.value);
              }}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Tous les statuts</option>
              <option value="EN_ATTENTE">En attente</option>
              <option value="VALIDEE">Validée</option>
              <option value="REFUSEE">Refusée</option>
              <option value="ANNULEE">Annulée</option>
              <option value="EXPIREE">Expirée</option>
              <option value="REMISE">Remise</option>
            </select>
          </div>
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-slate-400">
              <tr>
                <th className="py-2">Lecteur</th>
                <th className="py-2">Ouvrage</th>
                <th className="py-2">Statut</th>
                <th className="py-2">Période</th>
                <th className="py-2">Montant</th>
                <th className="py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation) => (
                <tr key={reservation.id} className="border-t border-slate-100">
                  <td className="py-3 text-slate-700">{reservation.adherent_username}</td>
                  <td className="py-3 text-slate-600">{reservation.ouvrage_titre}</td>
                  <td className="py-3 text-slate-600">{reservation.statut}</td>
                  <td className="py-3 text-slate-600">
                    {formatDate(reservation.date_debut)} → {formatDate(reservation.date_fin)}
                  </td>
                  <td className="py-3 text-slate-600">{formatMoney(reservation.montant_estime)}</td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      disabled={reservation.statut !== "EN_ATTENTE"}
                      onClick={() => handleValider(reservation.id)}
                      className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      Valider
                    </button>
                    <button
                      type="button"
                      disabled={reservation.statut !== "EN_ATTENTE"}
                      onClick={() => handleRefuser(reservation.id)}
                      className="ml-2 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      Refuser
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && reservations.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-sm text-slate-400">
                    Aucune réservation.
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
