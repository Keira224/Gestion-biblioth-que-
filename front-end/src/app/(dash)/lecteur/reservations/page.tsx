"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "../../../../lib/api";
import { RoleGuard } from "../../../../components/RoleGuard";
import { TableCard } from "../../../../components/TableCard";
import { formatDate, formatMoney } from "../../../../lib/format";

export default function LecteurReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/reservations/me/");
      setReservations(response.data.results || []);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Impossible de charger vos réservations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const handleCancel = async (reservationId: number) => {
    try {
      await api.post(`/api/reservations/${reservationId}/annuler/`);
      await fetchReservations();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Annulation impossible.");
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

        <TableCard title="Mes réservations">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-slate-400">
              <tr>
                <th className="py-2">Ouvrage</th>
                <th className="py-2">Période</th>
                <th className="py-2">Statut</th>
                <th className="py-2">Montant</th>
                <th className="py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation) => (
                <tr key={reservation.id} className="border-t border-slate-100">
                  <td className="py-3 text-slate-700">{reservation.ouvrage_titre}</td>
                  <td className="py-3 text-slate-600">
                    {formatDate(reservation.date_debut)} → {formatDate(reservation.date_fin)}
                  </td>
                  <td className="py-3 text-slate-600">{reservation.statut}</td>
                  <td className="py-3 text-slate-600">{formatMoney(reservation.montant_estime)}</td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      disabled={reservation.statut !== "EN_ATTENTE"}
                      onClick={() => handleCancel(reservation.id)}
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 disabled:opacity-50"
                    >
                      Annuler
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
