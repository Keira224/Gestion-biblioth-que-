"use client";

import { useEffect, useState } from "react";
import { api } from "../../../../lib/api";
import { RoleGuard } from "../../../../components/RoleGuard";
import { TableCard } from "../../../../components/TableCard";

export default function BibliothecaireAdherentsPage() {
  const [adherents, setAdherents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdherents = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get("/api/adherents/");
        setAdherents(response.data.results || []);
      } catch (err: any) {
        setError(err?.response?.data?.detail || "Impossible de charger les adhérents.");
      } finally {
        setLoading(false);
      }
    };
    fetchAdherents();
  }, []);

  return (
    <RoleGuard allowed={["BIBLIOTHECAIRE"]}>
      <div className="space-y-6">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <TableCard title="Gestion des adhérents">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-slate-400">
              <tr>
                <th className="py-2">Nom</th>
                <th className="py-2">Email</th>
                <th className="py-2">Téléphone</th>
                <th className="py-2">Adresse</th>
              </tr>
            </thead>
            <tbody>
              {adherents.map((adherent) => (
                <tr key={adherent.id} className="border-t border-slate-100">
                  <td className="py-3 text-slate-700">
                    {adherent.prenom} {adherent.nom}
                  </td>
                  <td className="py-3 text-slate-600">{adherent.email}</td>
                  <td className="py-3 text-slate-600">{adherent.telephone}</td>
                  <td className="py-3 text-slate-600">{adherent.adresse}</td>
                </tr>
              ))}
              {!loading && adherents.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-sm text-slate-400">
                    Aucun adhérent enregistré.
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
