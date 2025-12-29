"use client";

import { useEffect, useState } from "react";

import { TableCard } from "@/components/TableCard";
import { api } from "@/lib/api";
import { useRoleGuard } from "@/lib/guard";

type Adherent = {
  id: number;
  username: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
};

export default function BibliothecaireAdherentsPage() {
  useRoleGuard(["BIBLIOTHECAIRE"]);
  const [adherents, setAdherents] = useState<Adherent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAdherents = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<Adherent[]>("/api/adherents/");
      setAdherents(data);
    } catch {
      setError("Impossible de charger les adhérents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdherents();
  }, []);

  return (
    <div className="space-y-6">
      {error ? <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</div> : null}

      <TableCard title="Liste des adhérents">
        {loading ? (
          <p className="text-sm text-slate-500">Chargement des adhérents...</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-slate-400">
                <th className="py-2">Nom</th>
                <th>Username</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Adresse</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {adherents.map((adherent) => (
                <tr key={adherent.id} className="text-slate-600">
                  <td className="py-3 font-medium text-slate-700">
                    {adherent.prenom} {adherent.nom}
                  </td>
                  <td>{adherent.username}</td>
                  <td>{adherent.email}</td>
                  <td>{adherent.telephone}</td>
                  <td>{adherent.adresse}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableCard>
    </div>
  );
}
