import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  BookMarked,
  ClipboardList,
  FileText,
  FileStack,
  LayoutDashboard,
  Layers,
  MessageSquare,
  Search,
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

export type QuickAction = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export const adminMenu: MenuItem[] = [
  { label: "Tableau de bord", href: "/admin", icon: LayoutDashboard },
  { label: "Utilisateurs", href: "/admin/utilisateurs", icon: Users },
  { label: "Ouvrages", href: "/admin/ouvrages", icon: BookOpen },
  { label: "Exemplaires", href: "/admin/exemplaires", icon: BookMarked },
  { label: "Emprunts", href: "/admin/emprunts", icon: ClipboardList },
  { label: "Historique des emprunts", href: "/admin/historique-emprunts", icon: FileText },
  { label: "Recherche avancee", href: "/admin/recherche-avancee", icon: Search },
  { label: "Retards", href: "/admin/retards", icon: AlertTriangle },
  { label: "Pénalités", href: "/admin/penalites", icon: Wallet },
  { label: "Réservations", href: "/admin/reservations", icon: Layers },
  { label: "Demandes de livres", href: "/admin/demandes-livres", icon: FileStack },
  { label: "E-books", href: "/admin/ebooks", icon: BookOpen },
  { label: "Messages", href: "/admin/messages", icon: MessageSquare },
  { label: "Statistiques", href: "/admin/statistiques", icon: BarChart3 },
];

export const bibliothecaireMenu: MenuItem[] = [
  { label: "Tableau de bord", href: "/bibliothecaire", icon: LayoutDashboard },
  { label: "Emprunts", href: "/bibliothecaire/emprunts", icon: ClipboardList },
  { label: "Retours", href: "/bibliothecaire/retours", icon: FileText },
  { label: "Historique des emprunts", href: "/bibliothecaire/historique-emprunts", icon: FileText },
  { label: "Recherche avancee", href: "/bibliothecaire/recherche-avancee", icon: Search },
  { label: "Retards", href: "/bibliothecaire/retards", icon: AlertTriangle },
  { label: "Pénalités", href: "/bibliothecaire/penalites", icon: Wallet },
  { label: "Réservations", href: "/bibliothecaire/reservations", icon: Layers },
  { label: "Ouvrages", href: "/bibliothecaire/ouvrages", icon: BookOpen },
  { label: "Exemplaires", href: "/bibliothecaire/exemplaires", icon: BookMarked },
  { label: "Adhérents", href: "/bibliothecaire/adherents", icon: UserSquare2 },
  { label: "Demandes de livres", href: "/bibliothecaire/demandes-livres", icon: FileStack },
  { label: "E-books", href: "/bibliothecaire/ebooks", icon: BookOpen },
  { label: "Messages", href: "/bibliothecaire/messages", icon: MessageSquare },
  { label: "Statistiques", href: "/bibliothecaire/statistiques", icon: BarChart3 },
];

export const lecteurMenu: MenuItem[] = [
  { label: "Tableau de bord", href: "/lecteur", icon: LayoutDashboard },
  { label: "Mes emprunts", href: "/lecteur/mes-emprunts", icon: ClipboardList },
  { label: "Mes pénalités", href: "/lecteur/mes-penalites", icon: Wallet },
  { label: "Catalogue", href: "/lecteur/catalogue", icon: BookOpen },
  { label: "Mes réservations", href: "/lecteur/reservations", icon: Layers },
  { label: "Demandes de livres", href: "/lecteur/demandes-livres", icon: FileStack },
  { label: "E-books", href: "/lecteur/ebooks", icon: BookOpen },
  { label: "Messages", href: "/lecteur/messages", icon: MessageSquare },
  { label: "Profil", href: "/lecteur/profil", icon: UserSquare2 },
];

export const menuByRole = (role: UserRole | null | undefined) => {
  if (role === "ADMIN") return adminMenu;
  if (role === "BIBLIOTHECAIRE") return bibliothecaireMenu;
  return lecteurMenu;
};

export const quickActionsByRole = (role: UserRole) => {
  if (role === "ADMIN") {
    return [
      { label: "Créer un utilisateur", href: "/admin/utilisateurs", icon: Users },
      { label: "Ajouter un ouvrage", href: "/admin/ouvrages", icon: BookOpen },
      { label: "Voir les retards", href: "/admin/retards", icon: AlertTriangle },
    ] satisfies QuickAction[];
  }
  if (role === "BIBLIOTHECAIRE") {
    return [
      { label: "Créer un emprunt", href: "/bibliothecaire/emprunts", icon: ClipboardList },
      { label: "Enregistrer un retour", href: "/bibliothecaire/retours", icon: FileText },
      { label: "Gérer les réservations", href: "/bibliothecaire/reservations", icon: Layers },
    ] satisfies QuickAction[];
  }
  return [
    { label: "Consulter le catalogue", href: "/lecteur/catalogue", icon: BookOpen },
    { label: "Mes emprunts", href: "/lecteur/mes-emprunts", icon: ClipboardList },
    { label: "Écrire un message", href: "/lecteur/messages", icon: MessageSquare },
  ] satisfies QuickAction[];
};

export const getSupportLink = (role: UserRole) => {
  if (role === "ADMIN") return "/admin/messages";
  if (role === "BIBLIOTHECAIRE") return "/bibliothecaire/messages";
  return "/lecteur/messages";
};

export const getBreadcrumbs = (pathname: string): BreadcrumbItem[] => {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return [];

  const base = segments[0];
  const root =
    base === "admin"
      ? { label: "Admin", href: "/admin" }
      : base === "bibliothecaire"
        ? { label: "Bibliothécaire", href: "/bibliothecaire" }
        : { label: "Lecteur", href: "/lecteur" };

  const title = getPageTitle(pathname);
  return [root, { label: title }];
};

export const getPageTitle = (pathname: string) => {
  const allMenus = [...adminMenu, ...bibliothecaireMenu, ...lecteurMenu];
  const match = allMenus.find((item) => pathname === item.href);
  if (match) return match.label;

  if (pathname.includes("/admin/utilisateurs")) return "Gestion des utilisateurs";
  if (pathname.includes("/admin/ouvrages")) return "Gestion des ouvrages";
  if (pathname.includes("/admin/exemplaires")) return "Gestion des exemplaires";
  if (pathname.includes("/admin/emprunts")) return "Gestion des emprunts";
  if (pathname.includes("/admin/recherche-avancee")) return "Recherche avancee";
  if (pathname.includes("/admin/penalites")) return "Gestion des pénalités";
  if (pathname.includes("/admin/reservations")) return "Gestion des réservations";
  if (pathname.includes("/admin/demandes-livres")) return "Demandes de livres";
  if (pathname.includes("/admin/ebooks")) return "Gestion des e-books";
  if (pathname.includes("/admin/messages")) return "Messages";
  if (pathname.includes("/bibliothecaire/emprunts")) return "Création des emprunts";
  if (pathname.includes("/bibliothecaire/retours")) return "Gestion des retours";
  if (pathname.includes("/bibliothecaire/recherche-avancee")) return "Recherche avancee";
  if (pathname.includes("/bibliothecaire/retards")) return "Emprunts en retard";
  if (pathname.includes("/bibliothecaire/reservations")) return "Réservations";
  if (pathname.includes("/bibliothecaire/demandes-livres")) return "Demandes de livres";
  if (pathname.includes("/bibliothecaire/ebooks")) return "Gestion des e-books";
  if (pathname.includes("/bibliothecaire/messages")) return "Messages";
  if (pathname.includes("/bibliothecaire/exemplaires")) return "Gestion des exemplaires";
  if (pathname.includes("/bibliothecaire/ouvrages")) return "Catalogue des ouvrages";
  if (pathname.includes("/bibliothecaire/adherents")) return "Gestion des adhérents";
  if (pathname.includes("/lecteur/mes-emprunts")) return "Mes emprunts";
  if (pathname.includes("/lecteur/mes-penalites")) return "Mes pénalités";
  if (pathname.includes("/lecteur/catalogue")) return "Catalogue";
  if (pathname.includes("/lecteur/reservations")) return "Mes réservations";
  if (pathname.includes("/lecteur/demandes-livres")) return "Mes demandes";
  if (pathname.includes("/lecteur/ebooks")) return "E-books";
  if (pathname.includes("/lecteur/messages")) return "Messages";
  if (pathname.includes("/lecteur/profil")) return "Mon profil";
  return "Tableau de bord";
};
