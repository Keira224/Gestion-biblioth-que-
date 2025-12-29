"use client";

import { useEffect, useState } from "react";
import { api } from "../../../../lib/api";
import { RoleGuard } from "../../../../components/RoleGuard";
import { TableCard } from "../../../../components/TableCard";

export default function LecteurCataloguePage() {
  const [ouvrages, setOuvrages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCatalogue = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get("/api/catalogue/ouvrages/");
        setOuvrages(response.data.results || []);
      } catch (err: any) {
        setError(err?.response?.data?.detail || "Impossible de charger le catalogue.");
      } finally {
        setLoading(false);
      }
    };
    fetchCatalogue();
  }, []);

  return (
    <RoleGuard allowed={["LECTEUR"]}>
      <div className="space-y-6">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <TableCard title="Catalogue des ouvrages">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-slate-400">
              <tr>
                <th className="py-2">Titre</th>
                <th className="py-2">Auteur</th>
                <th className="py-2">Catégorie</th>
                <th className="py-2">Disponibles</th>
              </tr>
            </thead>
            <tbody>
              {ouvrages.map((ouvrage) => (
                <tr key={ouvrage.id} className="border-t border-slate-100">
                  <td className="py-3 text-slate-700">{ouvrage.titre}</td>
                  <td className="py-3 text-slate-600">{ouvrage.auteur}</td>
                  <td className="py-3 text-slate-600">{ouvrage.categorie}</td>
                  <td className="py-3 text-slate-600">{ouvrage.exemplaires_disponibles}</td>
                </tr>
              ))}
              {!loading && ouvrages.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-sm text-slate-400">
                    Aucun ouvrage disponible.
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
