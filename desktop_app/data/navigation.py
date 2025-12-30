from dataclasses import dataclass


@dataclass
class MenuItem:
    label: str
    key: str


ADMIN_MENU = [
    MenuItem("Tableau de bord", "admin_dashboard"),
    MenuItem("Utilisateurs", "admin_users"),
    MenuItem("Ouvrages", "admin_ouvrages"),
    MenuItem("Exemplaires", "admin_exemplaires"),
    MenuItem("Emprunts", "admin_emprunts"),
    MenuItem("Retards", "admin_retards"),
    MenuItem("Pénalités", "admin_penalites"),
    MenuItem("Réservations", "admin_reservations"),
    MenuItem("Demandes de livres", "admin_demandes"),
    MenuItem("E-books", "admin_ebooks"),
    MenuItem("Messages", "admin_messages"),
]

BIBLIO_MENU = [
    MenuItem("Tableau de bord", "biblio_dashboard"),
    MenuItem("Emprunts", "biblio_emprunts"),
    MenuItem("Retours", "biblio_retours"),
    MenuItem("Retards", "biblio_retards"),
    MenuItem("Pénalités", "biblio_penalites"),
    MenuItem("Réservations", "biblio_reservations"),
    MenuItem("Ouvrages", "biblio_ouvrages"),
    MenuItem("Exemplaires", "biblio_exemplaires"),
    MenuItem("Adhérents", "biblio_adherents"),
    MenuItem("Demandes de livres", "biblio_demandes"),
    MenuItem("E-books", "biblio_ebooks"),
    MenuItem("Messages", "biblio_messages"),
]

LECTEUR_MENU = [
    MenuItem("Tableau de bord", "lecteur_dashboard"),
    MenuItem("Mes emprunts", "lecteur_emprunts"),
    MenuItem("Mes pénalités", "lecteur_penalites"),
    MenuItem("Catalogue", "lecteur_catalogue"),
    MenuItem("Mes réservations", "lecteur_reservations"),
    MenuItem("Demandes de livres", "lecteur_demandes"),
    MenuItem("E-books", "lecteur_ebooks"),
    MenuItem("Messages", "lecteur_messages"),
    MenuItem("Profil", "lecteur_profil"),
]
