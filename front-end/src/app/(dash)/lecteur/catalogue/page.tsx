"use client";

import { useEffect, useState } from "react";
import { BookOpen, Filter } from "lucide-react";
import { api } from "../../../../lib/api";
import { RoleGuard } from "../../../../components/RoleGuard";
import { TableCard } from "../../../../components/TableCard";
import { Modal } from "../../../../components/Modal";
import { EmptyState } from "../../../../components/EmptyState";

export default function LecteurCataloguePage() {
  const [ouvrages, setOuvrages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);
  const [dates, setDates] = useState({ date_debut: "", date_fin: "" });
  const [search, setSearch] = useState("");
  const [categorie, setCategorie] = useState("");
  const [typeRessource, setTypeRessource] = useState("");
  const [disponible, setDisponible] = useState("");
  const [ordering, setOrdering] = useState("-exemplaires_disponibles");

  useEffect(() => {
    const fetchCatalogue = async () => {
      setLoading(true);
      setError(null);
      setMessage(null);
      try {
        const response = await api.get("/api/catalogue/ouvrages/", {
          params: {
            search: search || undefined,
            categorie: categorie || undefined,
            type_ressource: typeRessource || undefined,
            disponible: disponible || undefined,
            ordering: ordering || undefined,
          },
        });
        setOuvrages(response.data.results || []);
      } catch (err: any) {
        setError(err?.response?.data?.detail || "Impossible de charger le catalogue.");
      } finally {
        setLoading(false);
      }
    };
    fetchCatalogue();
  }, [search, categorie, typeRessource, disponible, ordering]);

  const handleReserve = async () => {
    setError(null);
    setMessage(null);
    if (!selected) return;
    try {
      await api.post("/api/reservations/", {
        ouvrage_id: selected.id,
        date_debut: dates.date_debut,
        date_fin: dates.date_fin,
      });
      setMessage("Réservation enregistrée avec succès.");
      setOpen(false);
      setDates({ date_debut: "", date_fin: "" });
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Impossible de réserver cet ouvrage.");
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
        {message && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
            {message}
          </div>
        )}

        <TableCard
          title="Catalogue des ouvrages"
          action={
            <div className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500">
              <Filter className="h-4 w-4" />
              {ouvrages.length} résultat{ouvrages.length > 1 ? "s" : ""}
            </div>
          }
        >
          <div className="mb-6 grid gap-3 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <label className="text-xs font-semibold text-slate-500">Recherche</label>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                placeholder="Titre, auteur, ISBN..."
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Catégorie</label>
              <input
                value={categorie}
                onChange={(event) => setCategorie(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                placeholder="Ex: Informatique"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Type ressource</label>
              <select
                value={typeRessource}
                onChange={(event) => setTypeRessource(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="">Tous</option>
                <option value="LIVRE">Livre</option>
                <option value="DVD">DVD</option>
                <option value="RESSOURCE_NUMERIQUE">Ressource numérique</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Disponibilité</label>
              <select
                value={disponible}
                onChange={(event) => setDisponible(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="">Toutes</option>
                <option value="true">Disponible</option>
                <option value="false">Indisponible</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Trier par</label>
              <select
                value={ordering}
                onChange={(event) => setOrdering(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="titre">Titre (A-Z)</option>
                <option value="-titre">Titre (Z-A)</option>
                <option value="auteur">Auteur (A-Z)</option>
                <option value="-auteur">Auteur (Z-A)</option>
                <option value="-exemplaires_disponibles">Disponibilité</option>
              </select>
            </div>
          </div>

          {loading && (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-44 animate-pulse rounded-2xl border border-slate-100 bg-slate-50" />
              ))}
            </div>
          )}

          {!loading && ouvrages.length === 0 && (
            <EmptyState
              title="Aucun ouvrage trouvé"
              description="Essayez de modifier vos filtres ou recherchez un autre terme."
            />
          )}

          {!loading && ouvrages.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {ouvrages.map((ouvrage) => (
                <div key={ouvrage.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex gap-4">
                    <div className="flex h-28 w-20 items-center justify-center overflow-hidden rounded-xl bg-slate-100 text-slate-400">
                      {ouvrage.image ? (
                        <img src={ouvrage.image} alt={ouvrage.titre} className="h-full w-full object-cover" />
                      ) : (
                        <BookOpen className="h-6 w-6" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{ouvrage.titre}</p>
                        <p className="text-xs text-slate-500">{ouvrage.auteur}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                        <span className="rounded-full bg-slate-100 px-2 py-1">{ouvrage.categorie}</span>
                        <span className="rounded-full bg-slate-100 px-2 py-1">{ouvrage.type_ressource}</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {ouvrage.description_courte || "Aucune description disponible pour cet ouvrage."}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                    <span>
                      Disponibles: <strong className="text-slate-700">{ouvrage.exemplaires_disponibles}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelected(ouvrage);
                        setOpen(true);
                      }}
                      className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white"
                    >
                      Réserver
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TableCard>

        <Modal open={open} onClose={() => setOpen(false)} title="Réserver un ouvrage">
          <div className="flex gap-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <div className="flex h-16 w-12 items-center justify-center overflow-hidden rounded-lg bg-white text-slate-400">
              {selected?.image ? (
                <img src={selected.image} alt={selected.titre} className="h-full w-full object-cover" />
              ) : (
                <BookOpen className="h-5 w-5" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">{selected?.titre}</p>
              <p className="text-xs text-slate-500">{selected?.auteur}</p>
              <p className="mt-1 text-xs text-slate-500">
                {selected?.description_courte || "Aucune description disponible."}
              </p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-slate-500">Date début</label>
              <input
                type="date"
                value={dates.date_debut}
                onChange={(event) => setDates({ ...dates, date_debut: event.target.value })}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Date fin</label>
              <input
                type="date"
                value={dates.date_fin}
                onChange={(event) => setDates({ ...dates, date_fin: event.target.value })}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                required
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleReserve}
            className="w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Confirmer la réservation
          </button>
        </Modal>
      </div>
    </RoleGuard>
  );
}
