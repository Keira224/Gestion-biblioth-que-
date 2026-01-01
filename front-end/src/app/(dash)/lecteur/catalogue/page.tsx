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
<<<<<<< HEAD
  const [categoryFilter, setCategoryFilter] = useState("Toutes");
  const [availabilityFilter, setAvailabilityFilter] = useState("Toutes");
  const [typeFilter, setTypeFilter] = useState("Tous");
  const [sortBy, setSortBy] = useState("titre");
  const typeLabels: Record<string, string> = {
    LIVRE: "Livre",
    DVD: "DVD",
    RESSOURCE_NUMERIQUE: "Ressource numérique",
  };
=======
  const [categorie, setCategorie] = useState("");
  const [typeRessource, setTypeRessource] = useState("");
  const [disponible, setDisponible] = useState("");
  const [ordering, setOrdering] = useState("-exemplaires_disponibles");
>>>>>>> codex-verify

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

  const categories = Array.from(new Set(ouvrages.map((ouvrage) => ouvrage.categorie).filter(Boolean)));
  const types = Array.from(
    new Set(
      ouvrages
        .map((ouvrage) => ouvrage.type_ressource || ouvrage.type || ouvrage.format || ouvrage.type_document)
        .filter(Boolean),
    ),
  );

  const filteredOuvrages = ouvrages
    .filter((ouvrage) => {
      const searchTerm = search.trim().toLowerCase();
      if (!searchTerm) return true;
      return (
        String(ouvrage.titre || "").toLowerCase().includes(searchTerm) ||
        String(ouvrage.auteur || "").toLowerCase().includes(searchTerm) ||
        String(ouvrage.categorie || "").toLowerCase().includes(searchTerm)
      );
    })
    .filter((ouvrage) => (categoryFilter === "Toutes" ? true : ouvrage.categorie === categoryFilter))
    .filter((ouvrage) => {
      if (availabilityFilter === "Toutes") return true;
      const available = (ouvrage.exemplaires_disponibles || 0) > 0;
      return availabilityFilter === "Disponibles" ? available : !available;
    })
    .filter((ouvrage) => {
      if (typeFilter === "Tous") return true;
      const type = ouvrage.type_ressource || ouvrage.type || ouvrage.format || ouvrage.type_document;
      return type === typeFilter;
    })
    .sort((a, b) => {
      if (sortBy === "auteur") {
        return String(a.auteur || "").localeCompare(String(b.auteur || ""));
      }
      if (sortBy === "disponibilite") {
        return (b.exemplaires_disponibles || 0) - (a.exemplaires_disponibles || 0);
      }
      return String(a.titre || "").localeCompare(String(b.titre || ""));
    });

  const emptyStateMessage = search.trim()
    ? "Aucun ouvrage ne correspond à votre recherche."
    : "Aucun ouvrage disponible pour le moment.";
  const selectedThumbnailCandidates = [
    selected?.image_couverture,
    selected?.couverture,
    selected?.image_url,
    selected?.image?.url,
    selected?.image,
  ];
  const selectedThumbnail = selectedThumbnailCandidates.find(
    (value) => typeof value === "string" && value.trim().length > 0,
  );
  const selectedDescription =
    selected?.resume || selected?.description || selected?.resume_court || selected?.summary;
  const selectedType =
    selected?.type_ressource || selected?.type || selected?.format || selected?.type_document;
  const selectedTypeLabel = selectedType ? typeLabels[selectedType] ?? selectedType : "Non renseigné";
  const selectedCategory = selected?.categorie || "Non renseignée";
  const selectedDisponibilite = selected
    ? (selected.exemplaires_disponibles || 0) > 0
      ? `${selected.exemplaires_disponibles} disponible${selected.exemplaires_disponibles > 1 ? "s" : ""}`
      : "Indisponible"
    : "Statut inconnu";

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

<<<<<<< HEAD
        <TableCard title="Catalogue des ouvrages">
          <div className="space-y-5">
            <div className="grid gap-3 lg:grid-cols-[1.4fr,1fr,1fr,1fr]">
              <div className="relative">
                <input
                  type="search"
                  placeholder="Rechercher par titre, auteur ou catégorie"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                  🔍
                </span>
              </div>
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600"
              >
                <option value="Toutes">Toutes les catégories</option>
                {categories.map((categorie) => (
                  <option key={categorie} value={categorie}>
                    {categorie}
                  </option>
                ))}
              </select>
              <select
                value={availabilityFilter}
                onChange={(event) => setAvailabilityFilter(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600"
              >
                <option value="Toutes">Toutes les disponibilités</option>
                <option value="Disponibles">Disponibles</option>
                <option value="Indisponibles">Indisponibles</option>
              </select>
              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600"
              >
                <option value="Tous">Tous les types</option>
                {types.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
              <span>
                {filteredOuvrages.length} résultat{filteredOuvrages.length > 1 ? "s" : ""}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Trier par</span>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600"
                >
                  <option value="titre">Titre</option>
                  <option value="auteur">Auteur</option>
                  <option value="disponibilite">Disponibilité</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {loading &&
              Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="flex h-full flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="h-40 w-full animate-pulse rounded-xl bg-slate-100" />
                  <div className="space-y-2">
                    <div className="h-4 w-3/4 animate-pulse rounded-full bg-slate-100" />
                    <div className="h-3 w-1/2 animate-pulse rounded-full bg-slate-100" />
                    <div className="h-3 w-2/3 animate-pulse rounded-full bg-slate-100" />
                  </div>
                  <div className="mt-auto h-8 w-full animate-pulse rounded-full bg-slate-100" />
                </div>
              ))}
            {!loading &&
              filteredOuvrages.map((ouvrage) => {
                const type =
                  ouvrage.type_ressource || ouvrage.type || ouvrage.format || ouvrage.type_document || "Ouvrage";
                const resume =
                  ouvrage.resume ||
                  ouvrage.description ||
                  ouvrage.resume_court ||
                  ouvrage.summary ||
                  "Résumé non disponible pour cet ouvrage.";
                const disponible = (ouvrage.exemplaires_disponibles || 0) > 0;
                const image = ouvrage.image_couverture || ouvrage.couverture || ouvrage.image || "";
                return (
                  <div
                    key={ouvrage.id}
                    className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="relative h-40 w-full overflow-hidden rounded-xl bg-slate-100">
                      {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={image} alt={`Couverture de ${ouvrage.titre}`} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-400">
                          <span className="text-3xl">📘</span>
                          <span className="text-xs">Aucune couverture</span>
                        </div>
                      )}
                      <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        {type}
                      </span>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div>
                        <h3 className="text-base font-semibold text-slate-800">{ouvrage.titre}</h3>
                        <p className="text-sm text-slate-500">{ouvrage.auteur}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">
                          {ouvrage.categorie || "Sans catégorie"}
                        </span>
                        <span
                          className={`rounded-full px-2 py-1 font-semibold ${
                            disponible ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                          }`}
                        >
                          {disponible
                            ? `${ouvrage.exemplaires_disponibles} disponible${
                                ouvrage.exemplaires_disponibles > 1 ? "s" : ""
                              }`
                            : "Indisponible"}
                        </span>
                      </div>
                      <p className="line-clamp-3 text-sm text-slate-600">{resume}</p>
                    </div>
                    <div className="mt-auto pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setSelected(ouvrage);
                          setOpen(true);
                        }}
                        className="w-full rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white"
                      >
                        Réserver
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>

          {!loading && filteredOuvrages.length === 0 && (
            <div className="mt-10 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl">
                📚
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-700">Aucun résultat à afficher</h3>
              <p className="mt-2 text-sm text-slate-500">{emptyStateMessage}</p>
=======
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
>>>>>>> codex-verify
            </div>
          )}
        </TableCard>

<<<<<<< HEAD
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Réserver un ouvrage"
          header={
            <div className="flex flex-wrap items-center gap-4">
              <div className="h-16 w-16 overflow-hidden rounded-xl bg-white">
                {selectedThumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedThumbnail}
                    alt={`Couverture de ${selected?.titre ?? "cet ouvrage"}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xl text-slate-400">
                    📘
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-700">{selected?.titre || "Ouvrage"}</p>
                <p className="text-xs text-slate-500">{selected?.auteur || "Auteur non renseigné"}</p>
                <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-slate-500">
                  <span className="rounded-full bg-slate-100 px-3 py-1">Catégorie : {selectedCategory}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">Type : {selectedTypeLabel}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">Statut : {selectedDisponibilite}</span>
                </div>
              </div>
            </div>
          }
        >
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
            <p className="text-sm text-slate-600">
              {selectedDescription || "Aucune description disponible pour cet ouvrage."}
            </p>
=======
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
>>>>>>> codex-verify
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
