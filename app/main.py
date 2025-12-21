"""Application Tkinter simple pour la gestion de bibliothèque."""
from __future__ import annotations

import tkinter as tk
from tkinter import messagebox, ttk

from sqlalchemy.orm import Session

from . import auth, services
from .db import Adherent, Emprunt, Exemplaire, Ouvrage, Reservation, get_session, init_db, seed_demo


class LoginWindow(tk.Tk):
    def __init__(self, session: Session) -> None:
        super().__init__()
        self.title("Bibliothèque - Connexion")
        self.session = session
        self.geometry("320x200")
        self.resizable(False, False)

        tk.Label(self, text="Login").pack(pady=(20, 5))
        self.login_entry = tk.Entry(self)
        self.login_entry.pack()
        tk.Label(self, text="Mot de passe").pack(pady=5)
        self.password_entry = tk.Entry(self, show="*")
        self.password_entry.pack()

        tk.Button(self, text="Se connecter", command=self.authenticate).pack(pady=20)

    def authenticate(self):
        user = auth.authenticate(self.session, self.login_entry.get(), self.password_entry.get())
        if not user:
            messagebox.showerror("Erreur", "Identifiants invalides")
            return
        self.destroy()
        Dashboard(self.session, user)


class Dashboard(tk.Tk):
    def __init__(self, session: Session, user) -> None:
        super().__init__()
        self.session = session
        self.user = user
        self.title(f"Tableau de bord - {user.role}")
        self.geometry("900x600")

        self.create_header()
        self.create_tabs()

    def create_header(self):
        header = tk.Frame(self, bg="#1e3a8a", height=60)
        header.pack(fill=tk.X)
        tk.Label(
            header,
            text="Système de gestion de bibliothèque",
            fg="white",
            bg="#1e3a8a",
            font=("Arial", 16, "bold"),
        ).pack(side=tk.LEFT, padx=20, pady=10)
        tk.Label(header, text=f"Connecté : {self.user.login}", fg="white", bg="#1e3a8a").pack(
            side=tk.RIGHT, padx=20
        )

    def create_tabs(self):
        notebook = ttk.Notebook(self)
        notebook.pack(fill=tk.BOTH, expand=True)

        self.catalog_frame = CatalogFrame(notebook, self.session, self.user)
        notebook.add(self.catalog_frame, text="Catalogue")

        if self.user.role in {"Admin", "Bibliothecaire"}:
            self.loans_frame = LoansFrame(notebook, self.session)
            notebook.add(self.loans_frame, text="Prêts/Retours")

        if self.user.role == "Admin":
            self.stats_frame = StatsFrame(notebook, self.session)
            notebook.add(self.stats_frame, text="Statistiques")

        if self.user.role == "Lecteur":
            self.resa_frame = ReservationFrame(notebook, self.session, self.user)
            notebook.add(self.resa_frame, text="Réservations")


class CatalogFrame(tk.Frame):
    def __init__(self, parent, session: Session, user) -> None:
        super().__init__(parent)
        self.session = session
        self.user = user
        self.build_ui()
        self.refresh()

    def build_ui(self):
        search_bar = tk.Frame(self)
        search_bar.pack(fill=tk.X, padx=10, pady=10)
        tk.Label(search_bar, text="Recherche").pack(side=tk.LEFT)
        self.query_entry = tk.Entry(search_bar)
        self.query_entry.pack(side=tk.LEFT, padx=5)
        tk.Button(search_bar, text="Rechercher", command=self.refresh).pack(side=tk.LEFT)

        if self.user.role == "Admin":
            tk.Button(search_bar, text="Ajouter ouvrage", command=self.add_book_dialog).pack(side=tk.RIGHT)

        columns = ("ISBN", "Titre", "Auteur", "Catégorie", "Disponibilité")
        self.tree = ttk.Treeview(self, columns=columns, show="headings")
        for col in columns:
            self.tree.heading(col, text=col)
        self.tree.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

    def refresh(self):
        for row in self.tree.get_children():
            self.tree.delete(row)
        for ouvrage in services.search_catalog(self.session, self.query_entry.get()):
            dispo = "Oui" if ouvrage.disponible else "Non"
            self.tree.insert("", tk.END, values=(ouvrage.isbn, ouvrage.titre, ouvrage.auteur, ouvrage.categorie, dispo))

    def add_book_dialog(self):
        dialog = tk.Toplevel(self)
        dialog.title("Nouvel ouvrage")
        fields = {
            "isbn": tk.Entry(dialog),
            "titre": tk.Entry(dialog),
            "auteur": tk.Entry(dialog),
            "editeur": tk.Entry(dialog),
            "annee": tk.Entry(dialog),
            "categorie": tk.Entry(dialog),
        }
        for idx, (label, widget) in enumerate(fields.items()):
            tk.Label(dialog, text=label.capitalize()).grid(row=idx, column=0, padx=5, pady=5, sticky="e")
            widget.grid(row=idx, column=1, padx=5, pady=5)

        def submit():
            services.add_ouvrage(
                self.session,
                isbn=fields["isbn"].get(),
                titre=fields["titre"].get(),
                auteur=fields["auteur"].get(),
                editeur=fields["editeur"].get(),
                annee=int(fields["annee"].get() or 0) or None,
                categorie=fields["categorie"].get(),
            )
            dialog.destroy()
            self.refresh()

        tk.Button(dialog, text="Enregistrer", command=submit).grid(row=len(fields), column=0, columnspan=2, pady=10)


class LoansFrame(tk.Frame):
    def __init__(self, parent, session: Session) -> None:
        super().__init__(parent)
        self.session = session
        self.build_ui()

    def build_ui(self):
        form = tk.Frame(self)
        form.pack(fill=tk.X, padx=10, pady=10)
        tk.Label(form, text="Adhérent ID").grid(row=0, column=0, padx=5, pady=5)
        tk.Label(form, text="Exemplaire ID").grid(row=1, column=0, padx=5, pady=5)
        tk.Label(form, text="Emprunt ID (retour)").grid(row=2, column=0, padx=5, pady=5)

        self.adherent_entry = tk.Entry(form)
        self.exemplaire_entry = tk.Entry(form)
        self.emprunt_entry = tk.Entry(form)
        self.adherent_entry.grid(row=0, column=1)
        self.exemplaire_entry.grid(row=1, column=1)
        self.emprunt_entry.grid(row=2, column=1)

        tk.Button(form, text="Enregistrer l'emprunt", command=self.create_loan).grid(row=0, column=2, padx=10)
        tk.Button(form, text="Enregistrer retour", command=self.return_loan).grid(row=2, column=2, padx=10)

        self.status = tk.Label(self, text="")
        self.status.pack(pady=5)

    def create_loan(self):
        try:
            emprunt = services.emprunter(
                self.session,
                int(self.adherent_entry.get()),
                int(self.exemplaire_entry.get()),
            )
            self.status.config(text=f"Emprunt #{emprunt.id} créé pour {emprunt.date_retour_prevue}")
        except Exception as exc:
            messagebox.showerror("Erreur", str(exc))

    def return_loan(self):
        try:
            emprunt = services.retourner(self.session, int(self.emprunt_entry.get()))
            penalty = services.calculer_penalite(emprunt)
            self.status.config(text=f"Retour enregistré. Pénalité: {penalty:.2f}€")
        except Exception as exc:
            messagebox.showerror("Erreur", str(exc))


class StatsFrame(tk.Frame):
    def __init__(self, parent, session: Session) -> None:
        super().__init__(parent)
        self.session = session
        self.build_ui()
        self.refresh()

    def build_ui(self):
        self.rotation_list = self._make_tree("Rotation des ouvrages", ("Ouvrage", "Prêts"))
        self.top_readers = self._make_tree("Lecteurs actifs", ("Lecteur", "Prêts"))
        self.retards = self._make_tree("Retards fréquents", ("Ouvrage", "Retards"))

    def _make_tree(self, title: str, columns):
        frame = tk.LabelFrame(self, text=title)
        frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        tree = ttk.Treeview(frame, columns=columns, show="headings", height=5)
        for col in columns:
            tree.heading(col, text=col)
        tree.pack(fill=tk.BOTH, expand=True)
        return tree

    def refresh(self):
        for tree, data in [
            (self.rotation_list, services.rotation_ouvrages(self.session)),
            (self.top_readers, services.top_lecteurs(self.session)),
            (self.retards, services.retards_frequents(self.session)),
        ]:
            for row in tree.get_children():
                tree.delete(row)
            for item in data:
                tree.insert("", tk.END, values=item)


class ReservationFrame(tk.Frame):
    def __init__(self, parent, session: Session, user) -> None:
        super().__init__(parent)
        self.session = session
        self.user = user
        self.build_ui()
        self.refresh()

    def build_ui(self):
        search = tk.Frame(self)
        search.pack(fill=tk.X, padx=10, pady=10)
        tk.Label(search, text="Exemplaire ID").pack(side=tk.LEFT)
        self.ex_entry = tk.Entry(search)
        self.ex_entry.pack(side=tk.LEFT, padx=5)
        tk.Button(search, text="Réserver", command=self.reserve).pack(side=tk.LEFT)

        self.tree = ttk.Treeview(self, columns=("ID", "Exemplaire", "Statut"), show="headings")
        for col in ("ID", "Exemplaire", "Statut"):
            self.tree.heading(col, text=col)
        self.tree.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

    def reserve(self):
        try:
            services.reserver_exemplaire(self.session, self.user.adherent.id, int(self.ex_entry.get()))
            self.refresh()
        except Exception as exc:
            messagebox.showerror("Erreur", str(exc))

    def refresh(self):
        for row in self.tree.get_children():
            self.tree.delete(row)
        reservations = (
            self.session.query(Reservation)
            .filter_by(adherent_id=self.user.adherent.id)
            .order_by(Reservation.date_reservation.desc())
            .all()
        )
        for res in reservations:
            self.tree.insert("", tk.END, values=(res.id, res.exemplaire_id, res.statut))


def main():
    init_db()
    session = get_session()
    seed_demo(session)
    LoginWindow(session).mainloop()


if __name__ == "__main__":
    main()
