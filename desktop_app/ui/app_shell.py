import tkinter as tk
from typing import Callable

from data.navigation import ADMIN_MENU, BIBLIO_MENU, LECTEUR_MENU
from ui.theme import COLORS, SIDEBAR_WIDTH
from ui.widgets import make_button
from ui.pages import (
    AdminDashboard,
    AdminUsers,
    AdminOuvrages,
    AdminExemplaires,
    AdminEmprunts,
    AdminRetards,
    AdminPenalites,
    AdminReservations,
    AdminDemandes,
    AdminEbooks,
    AdminMessages,
    BiblioDashboard,
    BiblioEmprunts,
    BiblioRetours,
    BiblioRetards,
    BiblioPenalites,
    BiblioReservations,
    BiblioOuvrages,
    BiblioExemplaires,
    BiblioAdherents,
    BiblioDemandes,
    BiblioEbooks,
    BiblioMessages,
    LecteurDashboard,
    LecteurEmprunts,
    LecteurPenalites,
    LecteurCatalogue,
    LecteurReservations,
    LecteurDemandes,
    LecteurEbooks,
    LecteurMessages,
    LecteurProfil,
)


ROLE_COMPONENTS = {
    "admin_dashboard": AdminDashboard,
    "admin_users": AdminUsers,
    "admin_ouvrages": AdminOuvrages,
    "admin_exemplaires": AdminExemplaires,
    "admin_emprunts": AdminEmprunts,
    "admin_retards": AdminRetards,
    "admin_penalites": AdminPenalites,
    "admin_reservations": AdminReservations,
    "admin_demandes": AdminDemandes,
    "admin_ebooks": AdminEbooks,
    "admin_messages": AdminMessages,
    "biblio_dashboard": BiblioDashboard,
    "biblio_emprunts": BiblioEmprunts,
    "biblio_retours": BiblioRetours,
    "biblio_retards": BiblioRetards,
    "biblio_penalites": BiblioPenalites,
    "biblio_reservations": BiblioReservations,
    "biblio_ouvrages": BiblioOuvrages,
    "biblio_exemplaires": BiblioExemplaires,
    "biblio_adherents": BiblioAdherents,
    "biblio_demandes": BiblioDemandes,
    "biblio_ebooks": BiblioEbooks,
    "biblio_messages": BiblioMessages,
    "lecteur_dashboard": LecteurDashboard,
    "lecteur_emprunts": LecteurEmprunts,
    "lecteur_penalites": LecteurPenalites,
    "lecteur_catalogue": LecteurCatalogue,
    "lecteur_reservations": LecteurReservations,
    "lecteur_demandes": LecteurDemandes,
    "lecteur_ebooks": LecteurEbooks,
    "lecteur_messages": LecteurMessages,
    "lecteur_profil": LecteurProfil,
}


class AppShell:
    def __init__(self, root: tk.Tk) -> None:
        self.root = root
        self.active_role = tk.StringVar(value="ADMIN")
        self.active_page = tk.StringVar(value="admin_dashboard")

        self.root.configure(bg=COLORS["background"])
        self._build_layout()
        self._render_sidebar()
        self._render_content()

    def _build_layout(self) -> None:
        self.sidebar = tk.Frame(self.root, bg=COLORS["sidebar_bg"], width=SIDEBAR_WIDTH)
        self.sidebar.pack(side="left", fill="y")

        self.main = tk.Frame(self.root, bg=COLORS["background"])
        self.main.pack(side="right", fill="both", expand=True)

        self.topbar = tk.Frame(self.main, bg=COLORS["card"], height=64)
        self.topbar.pack(side="top", fill="x")

        self.content = tk.Frame(self.main, bg=COLORS["background"])
        self.content.pack(side="top", fill="both", expand=True)

        role_selector = tk.Frame(self.topbar, bg=COLORS["card"])
        role_selector.pack(side="right", padx=16, pady=12)

        tk.Label(role_selector, text="Role:", bg=COLORS["card"], fg=COLORS["muted"]).pack(side="left")
        for role in ("ADMIN", "BIBLIOTHECAIRE", "LECTEUR"):
            tk.Radiobutton(
                role_selector,
                text=role,
                value=role,
                variable=self.active_role,
                command=self._on_role_change,
                bg=COLORS["card"],
            ).pack(side="left")

        self.title_label = tk.Label(
            self.topbar,
            text="Tableau de bord",
            bg=COLORS["card"],
            fg=COLORS["text"],
            font=("Segoe UI", 14, "bold"),
        )
        self.title_label.pack(side="left", padx=16)

    def _render_sidebar(self) -> None:
        for widget in self.sidebar.winfo_children():
            widget.destroy()

        header = tk.Frame(self.sidebar, bg=COLORS["sidebar_bg"])
        header.pack(fill="x", pady=16)
        tk.Label(
            header,
            text="GB",
            bg=COLORS["sidebar_dark"],
            fg="white",
            width=4,
            height=2,
            font=("Segoe UI", 12, "bold"),
        ).pack(pady=4)
        tk.Label(
            header,
            text="Gestion Bibliothèque",
            bg=COLORS["sidebar_bg"],
            fg="white",
            font=("Segoe UI", 11, "bold"),
        ).pack()
        tk.Label(
            header,
            text="Desktop App",
            bg=COLORS["sidebar_bg"],
            fg="#cbd5f5",
            font=("Segoe UI", 9),
        ).pack()

        menu_items = self._menu_for_role()
        for item in menu_items:
            btn = tk.Button(
                self.sidebar,
                text=item.label,
                bg=COLORS["primary"] if self.active_page.get() == item.key else COLORS["sidebar_bg"],
                fg="white",
                relief="flat",
                anchor="w",
                padx=12,
                pady=6,
                command=lambda key=item.key, label=item.label: self._set_page(key, label),
            )
            btn.pack(fill="x", padx=12, pady=2)

        make_button(
            self.sidebar,
            "Déconnexion",
            command=self._logout,
            variant="primary",
        ).pack(side="bottom", fill="x", padx=16, pady=16)

    def _menu_for_role(self):
        role = self.active_role.get()
        if role == "ADMIN":
            return ADMIN_MENU
        if role == "BIBLIOTHECAIRE":
            return BIBLIO_MENU
        return LECTEUR_MENU

    def _set_page(self, key: str, label: str) -> None:
        self.active_page.set(key)
        self.title_label.config(text=label)
        self._render_sidebar()
        self._render_content()

    def _render_content(self) -> None:
        for widget in self.content.winfo_children():
            widget.destroy()
        component_cls = ROLE_COMPONENTS.get(self.active_page.get())
        if component_cls:
            component_cls(self.content)

    def _on_role_change(self) -> None:
        role = self.active_role.get()
        default_key = {
            "ADMIN": "admin_dashboard",
            "BIBLIOTHECAIRE": "biblio_dashboard",
            "LECTEUR": "lecteur_dashboard",
        }[role]
        self._set_page(default_key, "Tableau de bord")

    def _logout(self) -> None:
        self.root.destroy()
