"use client";

import { useEffect, useState } from "react";
import { api } from "../../../../lib/api";
import { RoleGuard } from "../../../../components/RoleGuard";
import { TableCard } from "../../../../components/TableCard";
import { formatDate } from "../../../../lib/format";

export default function BibliothecaireReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReservations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/reservations/");
      setReservations(response.data.results || []);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Impossible de charger les réservations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleHonorer = async (reservationId: number) => {
    try {
      await api.post(`/api/reservations/${reservationId}/honorer/`);
      await fetchReservations();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Impossible d'honorer la réservation.");
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
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-slate-400">
              <tr>
                <th className="py-2">Lecteur</th>
                <th className="py-2">Ouvrage</th>
                <th className="py-2">Statut</th>
                <th className="py-2">Date</th>
                <th className="py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation) => (
                <tr key={reservation.id} className="border-t border-slate-100">
                  <td className="py-3 text-slate-700">{reservation.adherent_username}</td>
                  <td className="py-3 text-slate-600">{reservation.ouvrage_titre}</td>
                  <td className="py-3 text-slate-600">{reservation.statut}</td>
                  <td className="py-3 text-slate-600">{formatDate(reservation.date_creation)}</td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      disabled={reservation.statut !== "EN_ATTENTE"}
                      onClick={() => handleHonorer(reservation.id)}
                      className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      Honorer
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && reservations.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-sm text-slate-400">
                    Aucune réservation.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </TableCard>
      </div>
    </RoleGuard>
  );
}
