import {
  Book,
  BookOpen,
  BookUser,
  CalendarCheck,
  ClipboardList,
  LayoutDashboard,
  Library,
  ShieldCheck,
  Ticket,
  Timer,
  User,
  Users,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

export type UserRole = "ADMIN" | "BIBLIOTHECAIRE" | "LECTEUR";

export type MenuItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const roleHomeMap: Record<UserRole, string> = {
  ADMIN: "/admin",
  BIBLIOTHECAIRE: "/bibliothecaire",
  LECTEUR: "/lecteur",
};

export const menuByRole: Record<UserRole, MenuItem[]> = {
  ADMIN: [
    { label: "Tableau de bord", href: "/admin", icon: LayoutDashboard },
    { label: "Utilisateurs", href: "/admin/utilisateurs", icon: Users },
    { label: "Ouvrages", href: "/admin/ouvrages", icon: BookOpen },
    { label: "Exemplaires", href: "/admin/exemplaires", icon: Book },
    { label: "Emprunts", href: "/admin/emprunts", icon: ClipboardList },
    { label: "Retards", href: "/admin/retards", icon: Timer },
    { label: "Pénalités", href: "/admin/penalites", icon: Ticket },
    { label: "Statistiques", href: "/admin/statistiques", icon: ShieldCheck },
  ],
  BIBLIOTHECAIRE: [
    { label: "Tableau de bord", href: "/bibliothecaire", icon: LayoutDashboard },
    { label: "Emprunts", href: "/bibliothecaire/emprunts", icon: ClipboardList },
    { label: "Retours", href: "/bibliothecaire/retours", icon: CalendarCheck },
    { label: "Retards", href: "/bibliothecaire/retards", icon: Timer },
    { label: "Pénalités", href: "/bibliothecaire/penalites", icon: Ticket },
    { label: "Ouvrages", href: "/bibliothecaire/ouvrages", icon: BookOpen },
    { label: "Adhérents", href: "/bibliothecaire/adherents", icon: Users },
  ],
  LECTEUR: [
    { label: "Tableau de bord", href: "/lecteur", icon: LayoutDashboard },
    { label: "Mes emprunts", href: "/lecteur/mes-emprunts", icon: BookUser },
    { label: "Mes pénalités", href: "/lecteur/mes-penalites", icon: Ticket },
    { label: "Catalogue", href: "/lecteur/catalogue", icon: Library },
    { label: "Profil", href: "/lecteur/profil", icon: User },
  ],
};

const titleMap: Record<string, string> = {
  "/admin": "Tableau de bord",
  "/admin/utilisateurs": "Gestion des utilisateurs",
  "/admin/ouvrages": "Gestion des ouvrages",
  "/admin/exemplaires": "Gestion des exemplaires",
  "/admin/emprunts": "Gestion des emprunts",
  "/admin/retards": "Gestion des retards",
  "/admin/penalites": "Gestion des pénalités",
  "/admin/statistiques": "Statistiques",
  "/bibliothecaire": "Tableau de bord",
  "/bibliothecaire/emprunts": "Gestion des emprunts",
  "/bibliothecaire/retours": "Gestion des retours",
  "/bibliothecaire/retards": "Emprunts en retard",
  "/bibliothecaire/penalites": "Pénalités",
  "/bibliothecaire/ouvrages": "Catalogue ouvrages",
  "/bibliothecaire/adherents": "Liste des adhérents",
  "/lecteur": "Tableau de bord",
  "/lecteur/mes-emprunts": "Mes emprunts",
  "/lecteur/mes-penalites": "Mes pénalités",
  "/lecteur/catalogue": "Catalogue",
  "/lecteur/profil": "Mon profil",
};

export function getPageTitle(pathname: string) {
  return titleMap[pathname] ?? "Tableau de bord";
}
