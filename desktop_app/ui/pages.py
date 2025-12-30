import tkinter as tk

from ui.theme import COLORS
from ui.widgets import make_card


def _make_header(parent: tk.Widget, title: str, subtitle: str) -> None:
    tk.Label(parent, text=title, bg=COLORS["background"], fg=COLORS["text"], font=("Segoe UI", 16, "bold")).pack(anchor="w")
    tk.Label(parent, text=subtitle, bg=COLORS["background"], fg=COLORS["muted"], font=("Segoe UI", 10)).pack(anchor="w")


def _make_placeholder(parent: tk.Widget, text: str) -> None:
    card = make_card(parent)
    card.pack(fill="x", pady=12)
    tk.Label(card, text=text, bg=COLORS["card"], fg=COLORS["muted"], pady=12).pack()


def _page(parent: tk.Widget, title: str, subtitle: str, content: str) -> None:
    frame = tk.Frame(parent, bg=COLORS["background"])
    frame.pack(fill="both", expand=True, padx=24, pady=16)
    _make_header(frame, title, subtitle)
    _make_placeholder(frame, content)


class AdminDashboard:
    def __init__(self, parent: tk.Widget) -> None:
        _page(parent, "Tableau de bord", "Vue globale", "KPIs, emprunts récents, activités...")


class AdminUsers:
    def __init__(self, parent: tk.Widget) -> None:
        _page(parent, "Utilisateurs", "CRUD complet", "Liste, recherche, édition et suppression.")


class AdminOuvrages:
    def __init__(self, parent: tk.Widget) -> None:
        _page(parent, "Ouvrages", "Catalogue", "Ajout, modification et suppression d'ouvrages.")


class AdminExemplaires:
    def __init__(self, parent: tk.Widget) -> None:
        _page(parent, "Exemplaires", "Stock", "Gestion des exemplaires par ouvrage.")


class AdminEmprunts:
    def __init__(self, parent: tk.Widget) -> None:
        _page(parent, "Emprunts", "Historique", "Suivi des emprunts en cours et passés.")


class AdminRetards:
    def __init__(self, parent: tk.Widget) -> None:
        _page(parent, "Retards", "Alertes", "Liste des emprunts en retard.")


class AdminPenalites:
    def __init__(self, parent: tk.Widget) -> None:
        _page(parent, "Pénalités", "Suivi", "Gestion des pénalités et paiements.")


class AdminReservations:
    def __init__(self, parent: tk.Widget) -> None:
        _page(parent, "Réservations", "Workflow", "Validation/refus des réservations.")


class AdminDemandes:
    def __init__(self, parent: tk.Widget) -> None:
        _page(parent, "Demandes de livres", "Workflow", "Traitement des demandes lecteurs.")


class AdminEbooks:
    def __init__(self, parent: tk.Widget) -> None:
        _page(parent, "E-books", "Catalogue numérique", "Ajout, tarification et téléchargements.")


class AdminMessages:
    def __init__(self, parent: tk.Widget) -> None:
        _page(parent, "Messages", "Communication", "Messagerie interne (bientôt).")


class BiblioDashboard:
    def __init__(self, parent: tk.Widget) -> None:
        _page(parent, "Tableau de bord", "Opérations", "KPIs et actions rapides.")


class BiblioEmprunts:
    def __init__(self, parent: tk.Widget) -> None:
        _page(parent, "Emprunts", "Opérations", "Créer et suivre les emprunts.")


class BiblioRetours:
    def __init__(self, parent: tk.Widget) -> None:
        _page(parent, "Retours", "Opérations", "Enregistrer les retours.")


class BiblioRetards:
    def __init__(self, parent: tk.Widget) -> None:
        _page(parent, "Retards", "Alertes", "Suivi des retards.")


class BiblioPenalites:
    def __init__(self, parent: tk.Widget) -> None:
        _page(parent, "Pénalités", "Suivi", "Gestion des pénalités.")


class BiblioReservations:
    def __init__(self, parent: tk.Widget) -> None:
        _page(parent, "Réservations", "Workflow", "Valider ou refuser.")


class BiblioOuvrages:
    def __init__(self, parent: tk.Widget) -> None:
        _page(parent, "Ouvrages", "Catalogue", "CRUD des ouvrages.")


class BiblioExemplaires:
    def __init__(self, parent: tk.Widget) -> None:
        _page(parent, "Exemplaires", "Stock", "CRUD des exemplaires.")


class BiblioAdherents:
    def __init__(self, parent: tk.Widget) -> None:
        _page(parent, "Adhérents", "Gestion", "Liste des adhérents.")


class BiblioDemandes:
    def __init__(self, parent: tk.Widget) -> None:
        _page(parent, "Demandes de livres", "Workflow", "Traitement des demandes.")


class BiblioEbooks:
    def __init__(self, parent: tk.Widget) -> None:
        _page(parent, "E-books", "Catalogue numérique", "Gestion des fichiers numériques.")


class BiblioMessages:
    def __init__(self, parent: tk.Widget) -> None:
        _page(parent, "Messages", "Communication", "Messagerie interne (bientôt).")


class LecteurDashboard:
    def __init__(self, parent: tk.Widget) -> None:
        _page(parent, "Tableau de bord", "Mon compte", "Résumé personnel.")


class LecteurEmprunts:
    def __init__(self, parent: tk.Widget) -> None:
        _page(parent, "Mes emprunts", "Historique", "Suivi des emprunts.")


class LecteurPenalites:
    def __init__(self, parent: tk.Widget) -> None:
        _page(parent, "Mes pénalités", "Suivi", "Montants et statuts.")


class LecteurCatalogue:
    def __init__(self, parent: tk.Widget) -> None:
        _page(parent, "Catalogue", "Découverte", "Catalogue des ouvrages.")


class LecteurReservations:
    def __init__(self, parent: tk.Widget) -> None:
        _page(parent, "Mes réservations", "Suivi", "Demandes de réservation.")


class LecteurDemandes:
    def __init__(self, parent: tk.Widget) -> None:
        _page(parent, "Demandes de livres", "Suivi", "Demandes de nouveaux ouvrages.")


class LecteurEbooks:
    def __init__(self, parent: tk.Widget) -> None:
        _page(parent, "E-books", "Téléchargements", "Accès aux e-books.")


class LecteurMessages:
    def __init__(self, parent: tk.Widget) -> None:
        _page(parent, "Messages", "Communication", "Messagerie interne (bientôt).")


class LecteurProfil:
    def __init__(self, parent: tk.Widget) -> None:
        _page(parent, "Profil", "Mon compte", "Informations personnelles.")
