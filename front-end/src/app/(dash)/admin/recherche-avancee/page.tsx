"use client";

import { useEffect, useState } from "react";
import { api } from "../../../../lib/api";
import { RoleGuard } from "../../../../components/RoleGuard";
import { TableCard } from "../../../../components/TableCard";
import { formatDate } from "../../../../lib/format";

export default function AdminRechercheAvanceePage() {
  const [catalogue, setCatalogue] = useState<any[]>([]);
  const [emprunts, setEmprunts] = useState<any[]>([]);
  const [retards, setRetards] = useState<any[]>([]);
  const [adherents, setAdherents] = useState<any[]>([]);
  const [adherentOptions, setAdherentOptions] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [titre, setTitre] = useState("");
  const [auteur, setAuteur] = useState("");
  const [isbn, setIsbn] = useState("");
  const [categorie, setCategorie] = useState("");
  const [typeRessource, setTypeRessource] = useState("");
  const [disponible, setDisponible] = useState("");
  const [statut, setStatut] = useState("");
  const [adherentId, setAdherentId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdherents = async () => {
      try {
        const response = await api.get("/api/adherents/", { params: { page_size: 200 } });
        setAdherentOptions(response.data.results || []);
      } catch (err: any) {
        setError(err?.response?.data?.detail || "Impossible de charger les adherents.");
      }
    };
    fetchAdherents();
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const [catalogueRes, empruntsRes, retardsRes, adherentsRes] = await Promise.all([
          api.get("/api/catalogue/ouvrages/", {
            params: {
              page_size: 10,
              search: search || undefined,
              titre: titre || undefined,
              auteur: auteur || undefined,
              isbn: isbn || undefined,
              categorie: categorie || undefined,
              type_ressource: typeRessource || undefined,
              disponible: disponible || undefined,
            },
          }),
          api.get("/api/emprunts/historique/", {
            params: {
              page_size: 10,
              search: search || undefined,
              statut: statut || undefined,
              adherent_id: adherentId || undefined,
            },
          }),
          api.get("/api/emprunts/retards/", {
            params: { page_size: 10, search: search || undefined },
          }),
          api.get("/api/adherents/", {
            params: { page_size: 10, search: search || undefined },
          }),
        ]);

        setCatalogue(catalogueRes.data.results || []);
        setEmprunts(empruntsRes.data.results || []);
        setRetards(retardsRes.data.results || []);
        setAdherents(adherentsRes.data.results || []);
      } catch (err: any) {
        setError(err?.response?.data?.detail || "Impossible de charger la recherche avancee.");
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [search, titre, auteur, isbn, categorie, typeRessource, disponible, statut, adherentId]);

  return (
    <RoleGuard allowed={["ADMIN"]}>
      <div className="space-y-6">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800">Recherche avancee</h3>
          <div className="mt-4 grid gap-3 lg:grid-cols-6">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Recherche globale..."
            />
            <input
              value={titre}
              onChange={(event) => setTitre(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Titre"
            />
            <input
              value={auteur}
              onChange={(event) => setAuteur(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Auteur"
            />
            <input
              value={isbn}
              onChange={(event) => setIsbn(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="ISBN"
            />
            <input
              value={categorie}
              onChange={(event) => setCategorie(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Categorie"
            />
            <select
              value={typeRessource}
              onChange={(event) => setTypeRessource(event.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Type ressource</option>
              <option value="LIVRE">Livre</option>
              <option value="DVD">DVD</option>
              <option value="RESSOURCE_NUMERIQUE">Ressource numerique</option>
            </select>
            <select
              value={disponible}
              onChange={(event) => setDisponible(event.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Disponibilite</option>
              <option value="true">Disponible</option>
              <option value="false">Indisponible</option>
            </select>
            <select
              value={statut}
              onChange={(event) => setStatut(event.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Statut emprunt</option>
              <option value="EN_COURS">En cours</option>
              <option value="EN_RETARD">En retard</option>
              <option value="RETOURNE">Retourne</option>
            </select>
            <select
              value={adherentId}
              onChange={(event) => setAdherentId(event.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Lecteur</option>
              {adherentOptions.map((adherent) => (
                <option key={adherent.id} value={adherent.id}>
                  {adherent.prenom} {adherent.nom} ({adherent.username})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <TableCard title="Catalogue (ouvrages)">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-slate-400">
                <tr>
                  <th className="py-2">Titre</th>
                  <th className="py-2">Auteur</th>
                  <th className="py-2">ISBN</th>
                  <th className="py-2">Dispo</th>
                </tr>
              </thead>
              <tbody>
                {catalogue.map((ouvrage) => (
                  <tr key={ouvrage.id} className="border-t border-slate-100">
                    <td className="py-3 text-slate-700">{ouvrage.titre}</td>
                    <td className="py-3 text-slate-600">{ouvrage.auteur}</td>
                    <td className="py-3 text-slate-600">{ouvrage.isbn}</td>
                    <td className="py-3 text-slate-600">{ouvrage.exemplaires_disponibles}</td>
                  </tr>
                ))}
                {loading && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-sm text-slate-400">
                      Chargement...
                    </td>
                  </tr>
                )}
                {!loading && catalogue.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-sm text-slate-400">
                      Aucun ouvrage trouve.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </TableCard>

          <TableCard title="Emprunts (historique)">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-slate-400">
                <tr>
                  <th className="py-2">Lecteur</th>
                  <th className="py-2">Ouvrage</th>
                  <th className="py-2">Statut</th>
                  <th className="py-2">Emprunt</th>
                </tr>
              </thead>
              <tbody>
                {emprunts.map((emprunt) => (
                  <tr key={emprunt.id} className="border-t border-slate-100">
                    <td className="py-3 text-slate-700">{emprunt.adherent_username}</td>
                    <td className="py-3 text-slate-600">{emprunt.ouvrage_titre}</td>
                    <td className="py-3 text-slate-600">{emprunt.statut}</td>
                    <td className="py-3 text-slate-600">{formatDate(emprunt.date_emprunt)}</td>
                  </tr>
                ))}
                {loading && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-sm text-slate-400">
                      Chargement...
                    </td>
                  </tr>
                )}
                {!loading && emprunts.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-sm text-slate-400">
                      Aucun emprunt trouve.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </TableCard>

          <TableCard title="Retards">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-slate-400">
                <tr>
                  <th className="py-2">Lecteur</th>
                  <th className="py-2">Ouvrage</th>
                  <th className="py-2">Jours</th>
                  <th className="py-2">Retour prevu</th>
                </tr>
              </thead>
              <tbody>
                {retards.map((retard) => (
                  <tr key={retard.id} className="border-t border-slate-100">
                    <td className="py-3 text-slate-700">{retard.adherent_username}</td>
                    <td className="py-3 text-slate-600">{retard.ouvrage_titre}</td>
                    <td className="py-3 text-slate-600">{retard.jours_retard}</td>
                    <td className="py-3 text-slate-600">{formatDate(retard.date_retour_prevue)}</td>
                  </tr>
                ))}
                {loading && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-sm text-slate-400">
                      Chargement...
                    </td>
                  </tr>
                )}
                {!loading && retards.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-sm text-slate-400">
                      Aucun retard trouve.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </TableCard>

          <TableCard title="Adherents">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-slate-400">
                <tr>
                  <th className="py-2">Nom</th>
                  <th className="py-2">Prenom</th>
                  <th className="py-2">Utilisateur</th>
                  <th className="py-2">Telephone</th>
                </tr>
              </thead>
              <tbody>
                {adherents.map((adherent) => (
                  <tr key={adherent.id} className="border-t border-slate-100">
                    <td className="py-3 text-slate-700">{adherent.nom}</td>
                    <td className="py-3 text-slate-600">{adherent.prenom}</td>
                    <td className="py-3 text-slate-600">{adherent.username}</td>
                    <td className="py-3 text-slate-600">{adherent.telephone || "-"}</td>
                  </tr>
                ))}
                {loading && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-sm text-slate-400">
                      Chargement...
                    </td>
                  </tr>
                )}
                {!loading && adherents.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-sm text-slate-400">
                      Aucun adherent trouve.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </TableCard>
        </div>
      </div>
    </RoleGuard>
  );
}
