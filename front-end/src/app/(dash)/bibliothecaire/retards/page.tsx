"use client";

import { useEffect, useState } from "react";
import { api } from "../../../../lib/api";
import { RoleGuard } from "../../../../components/RoleGuard";
import { TableCard } from "../../../../components/TableCard";
import { formatDate } from "../../../../lib/format";

export default function BibliothecaireRetardsPage() {
  const [retards, setRetards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRetards = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get("/api/emprunts/retards/");
        setRetards(response.data.results || []);
      } catch (err: any) {
        setError(err?.response?.data?.detail || "Impossible de charger les retards.");
      } finally {
        setLoading(false);
      }
    };
    fetchRetards();
  }, []);

  return (
    <RoleGuard allowed={["BIBLIOTHECAIRE"]}>
      <div className="space-y-6">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}
        <TableCard title="Emprunts en retard">
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
      </div>
    </RoleGuard>
  );
}
