"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { menuByRole } from "../lib/navigation";
import type { UserRole } from "../lib/auth";

export const Sidebar = ({
  role,
  onLogout,
  isOpen,
  onClose,
}: {
  role: UserRole;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const pathname = usePathname();
  const menu = menuByRole(role);
  const [stats, setStats] = useState<{
    nb_emprunts_en_retard?: number;
    nb_penalites_impayees?: number;
  } | null>(null);
  const [retardsCount, setRetardsCount] = useState<number | null>(null);
  const [penalitesCount, setPenalitesCount] = useState<number | null>(null);
  const [reservationsEnAttente, setReservationsEnAttente] = useState<number | null>(null);

  const quickActions = useMemo(() => {
    if (role === "BIBLIOTHECAIRE") {
      return [
        {
          label: "Créer emprunt",
          href: "/bibliothecaire/emprunts",
        },
        {
          label: "Valider réservations",
          href: "/bibliothecaire/reservations",
        },
      ];
    }
    if (role === "ADMIN") {
      return [
        {
          label: "Ajouter ouvrage",
          href: "/admin/ouvrages",
        },
        {
          label: "Suivre pénalités",
          href: "/admin/penalites",
        },
      ];
    }
    return [
      {
        label: "Rechercher un ouvrage",
        href: "/lecteur/catalogue",
      },
      {
        label: "Voir mes réservations",
        href: "/lecteur/reservations",
      },
    ];
  }, [role]);

  useEffect(() => {
    let isMounted = true;

    const fetchSidebarStats = async () => {
      try {
        const requests: Promise<any>[] = [
          api.get("/api/dashboard/stats/"),
          api.get("/api/reservations/", {
            params: {
              statut: "EN_ATTENTE",
              page_size: 1,
            },
          }),
        ];

        if (role !== "LECTEUR") {
          requests.push(
            api.get("/api/emprunts/retards/", {
              params: { page_size: 1 },
            }),
            api.get("/api/penalites/", {
              params: { payee: false, page_size: 1 },
            })
          );
        } else {
          requests.push(api.get("/api/penalites/me/", { params: { page_size: 1 } }));
        }

        const [statsRes, reservationsRes, retardsRes, penalitesRes] = await Promise.all(requests);

        if (!isMounted) return;
        const statsResume = statsRes.data?.resume ?? null;
        setStats(statsResume);
        if (role !== "LECTEUR") {
          setRetardsCount(retardsRes?.data?.pagination?.total ?? statsResume?.nb_emprunts_en_retard ?? 0);
          setPenalitesCount(penalitesRes?.data?.pagination?.total ?? statsResume?.nb_penalites_impayees ?? 0);
        } else {
          setRetardsCount(statsResume?.nb_emprunts_en_retard ?? 0);
          setPenalitesCount(statsResume?.nb_penalites_impayees ?? 0);
        }
        setReservationsEnAttente(
          reservationsRes.data?.pagination?.total ?? reservationsRes.data?.results?.length ?? 0
        );
      } catch (error) {
        if (!isMounted) return;
        setStats(null);
        setRetardsCount(null);
        setPenalitesCount(null);
        setReservationsEnAttente(null);
      }
    };

    fetchSidebarStats();

    return () => {
      isMounted = false;
    };
  }, [role]);

  const getBadgeValue = (href: string) => {
    if (href.includes("retards")) {
      return retardsCount ?? stats?.nb_emprunts_en_retard ?? null;
    }
    if (href.includes("penalites")) {
      return penalitesCount ?? stats?.nb_penalites_impayees ?? null;
    }
    if (href.includes("reservations")) {
      return reservationsEnAttente;
    }
    return null;
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-900/40 transition md:hidden ${isOpen ? "block" : "hidden"}`}
        onClick={onClose}
      />
      <aside
        className={`bg-sidebar-gradient fixed z-50 flex h-screen w-64 flex-col text-white shadow-xl transition md:static md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-6 pb-6 pt-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-xl font-bold">
            GB
          </div>
          <h1 className="mt-4 text-lg font-semibold">Gestion Bibliothèque</h1>
          <p className="mt-2 text-xs text-white/70">
            Plateforme professionnelle de suivi des emprunts et ressources.
          </p>
        </div>

        <nav className="flex-1 space-y-1 px-4">
          {menu.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            const badgeValue = getBadgeValue(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active ? "bg-white/20 text-white" : "text-white/80 hover:bg-white/10"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </span>
                {badgeValue !== null && (
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold text-white">
                    {badgeValue}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-6 pb-6 pt-2">
          <div className="rounded-xl border border-white/15 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/70">
              <Zap className="h-3.5 w-3.5" />
              Actions rapides
            </div>
            <div className="mt-3 space-y-2">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-white/90 transition hover:bg-white/10"
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 pt-0">
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-2 rounded-lg border border-white/30 px-3 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
};
