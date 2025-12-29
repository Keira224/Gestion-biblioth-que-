"use client";

import { useEffect, useState } from "react";

import { TableCard } from "@/components/TableCard";
import { api } from "@/lib/api";
import { useRoleGuard } from "@/lib/guard";

type Ouvrage = {
  id: number;
  titre: string;
  auteur: string;
  categorie: string;
  type_ressource: string;
  exemplaires_total: number;
  exemplaires_disponibles: number;
};

export default function BibliothecaireOuvragesPage() {
  useRoleGuard(["BIBLIOTHECAIRE"]);
  const [ouvrages, setOuvrages] = useState<Ouvrage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOuvrages = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<{ results: Ouvrage[] }>("/api/catalogue/ouvrages/?page_size=20");
      setOuvrages(data.results);
    } catch {
      setError("Impossible de charger le catalogue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOuvrages();
  }, []);

  return (
    <div className="space-y-6">
      {error ? <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</div> : null}

      <TableCard title="Catalogue ouvrages">
        {loading ? (
          <p className="text-sm text-slate-500">Chargement du catalogue...</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-slate-400">
                <th className="py-2">Titre</th>
                <th>Auteur</th>
                <th>Catégorie</th>
                <th>Type</th>
                <th>Disponibles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ouvrages.map((ouvrage) => (
                <tr key={ouvrage.id} className="text-slate-600">
                  <td className="py-3 font-medium text-slate-700">{ouvrage.titre}</td>
                  <td>{ouvrage.auteur}</td>
                  <td>{ouvrage.categorie}</td>
                  <td>{ouvrage.type_ressource}</td>
                  <td>
                    {ouvrage.exemplaires_disponibles}/{ouvrage.exemplaires_total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableCard>
    </div>
  );
}
