import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  BookMarked,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Users,
  UserSquare2,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { UserRole } from "./auth";

export type MenuItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const adminMenu: MenuItem[] = [
  { label: "Tableau de bord", href: "/admin", icon: LayoutDashboard },
  { label: "Utilisateurs", href: "/admin/utilisateurs", icon: Users },
  { label: "Ouvrages", href: "/admin/ouvrages", icon: BookOpen },
  { label: "Exemplaires", href: "/admin/exemplaires", icon: BookMarked },
  { label: "Emprunts", href: "/admin/emprunts", icon: ClipboardList },
  { label: "Retards", href: "/admin/retards", icon: AlertTriangle },
  { label: "Pénalités", href: "/admin/penalites", icon: Wallet },
  { label: "Statistiques", href: "/admin/statistiques", icon: BarChart3 },
];

export const bibliothecaireMenu: MenuItem[] = [
  { label: "Tableau de bord", href: "/bibliothecaire", icon: LayoutDashboard },
  { label: "Emprunts", href: "/bibliothecaire/emprunts", icon: ClipboardList },
  { label: "Retours", href: "/bibliothecaire/retours", icon: FileText },
  { label: "Retards", href: "/bibliothecaire/retards", icon: AlertTriangle },
  { label: "Pénalités", href: "/bibliothecaire/penalites", icon: Wallet },
  { label: "Ouvrages", href: "/bibliothecaire/ouvrages", icon: BookOpen },
  { label: "Adhérents", href: "/bibliothecaire/adherents", icon: UserSquare2 },
];

export const lecteurMenu: MenuItem[] = [
  { label: "Tableau de bord", href: "/lecteur", icon: LayoutDashboard },
  { label: "Mes emprunts", href: "/lecteur/mes-emprunts", icon: ClipboardList },
  { label: "Mes pénalités", href: "/lecteur/mes-penalites", icon: Wallet },
  { label: "Catalogue", href: "/lecteur/catalogue", icon: BookOpen },
  { label: "Profil", href: "/lecteur/profil", icon: UserSquare2 },
];

export const menuByRole = (role: UserRole | null | undefined) => {
  if (role === "ADMIN") return adminMenu;
  if (role === "BIBLIOTHECAIRE") return bibliothecaireMenu;
  return lecteurMenu;
};

export const getPageTitle = (pathname: string) => {
  const allMenus = [...adminMenu, ...bibliothecaireMenu, ...lecteurMenu];
  const match = allMenus.find((item) => pathname === item.href);
  if (match) return match.label;

  if (pathname.includes("/admin/utilisateurs")) return "Gestion des utilisateurs";
  if (pathname.includes("/admin/ouvrages")) return "Gestion des ouvrages";
  if (pathname.includes("/admin/exemplaires")) return "Gestion des exemplaires";
  if (pathname.includes("/admin/emprunts")) return "Gestion des emprunts";
  if (pathname.includes("/admin/penalites")) return "Gestion des pénalités";
  if (pathname.includes("/bibliothecaire/emprunts")) return "Création des emprunts";
  if (pathname.includes("/bibliothecaire/retours")) return "Gestion des retours";
  if (pathname.includes("/bibliothecaire/retards")) return "Emprunts en retard";
  if (pathname.includes("/bibliothecaire/ouvrages")) return "Catalogue des ouvrages";
  if (pathname.includes("/bibliothecaire/adherents")) return "Gestion des adhérents";
  if (pathname.includes("/lecteur/mes-emprunts")) return "Mes emprunts";
  if (pathname.includes("/lecteur/mes-penalites")) return "Mes pénalités";
  if (pathname.includes("/lecteur/catalogue")) return "Catalogue";
  if (pathname.includes("/lecteur/profil")) return "Mon profil";
  return "Tableau de bord";
};
