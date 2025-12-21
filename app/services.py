"""Domain services for catalogue, emprunts, reservations and stats."""
from __future__ import annotations

from datetime import date, datetime, timedelta
from typing import Iterable, List, Tuple

from sqlalchemy import func
from sqlalchemy.orm import Session

from .db import Adherent, Emprunt, Exemplaire, Ouvrage, Reservation

PENALTY_PER_DAY = 0.50


def add_ouvrage(session: Session, **kwargs) -> Ouvrage:
    ouvrage = Ouvrage(**kwargs)
    session.add(ouvrage)
    session.commit()
    return ouvrage


def add_exemplaire(session: Session, ouvrage_isbn: str, code_barre: str, etat: str = "bon") -> Exemplaire:
    ex = Exemplaire(ouvrage_isbn=ouvrage_isbn, code_barre=code_barre, etat=etat)
    session.add(ex)
    session.commit()
    return ex


def search_catalog(session: Session, query: str = "", **filters) -> List[Ouvrage]:
    q = session.query(Ouvrage)
    if query:
        like = f"%{query.lower()}%"
        q = q.filter(
            func.lower(Ouvrage.titre).like(like)
            | func.lower(Ouvrage.auteur).like(like)
            | func.lower(Ouvrage.isbn).like(like)
        )
    if filters.get("categorie"):
        q = q.filter_by(categorie=filters["categorie"])
    if filters.get("disponible") is not None:
        q = q.filter_by(disponible=filters["disponible"])
    return q.order_by(Ouvrage.titre).all()


def _rafraichir_disponibilite(session: Session, ouvrage_isbn: str) -> None:
    """Met à jour le flag Ouvrage.disponible selon les emprunts/réservations actifs."""

    total_exemplaires = session.query(Exemplaire).filter_by(ouvrage_isbn=ouvrage_isbn).count()
    emprunts_actifs = (
        session.query(Emprunt)
        .join(Exemplaire, Exemplaire.id == Emprunt.exemplaire_id)
        .filter(Exemplaire.ouvrage_isbn == ouvrage_isbn, Emprunt.statut == "en_cours")
        .count()
    )
    reservations_actives = (
        session.query(Reservation)
        .join(Exemplaire, Exemplaire.id == Reservation.exemplaire_id)
        .filter(Exemplaire.ouvrage_isbn == ouvrage_isbn, Reservation.statut == "active")
        .count()
    )

    ouvrage = session.get(Ouvrage, ouvrage_isbn)
    if ouvrage:
        ouvrage.disponible = (emprunts_actifs + reservations_actives) < total_exemplaires
        session.commit()


def reserver_exemplaire(session: Session, adherent_id: int, exemplaire_id: int) -> Reservation:
    exemplaire = session.get(Exemplaire, exemplaire_id)
    if not exemplaire:
        raise ValueError("Exemplaire introuvable")

    deja_reserve = (
        session.query(Reservation)
        .filter_by(exemplaire_id=exemplaire_id, statut="active")
        .first()
    )
    emprunt_encours = (
        session.query(Emprunt)
        .filter_by(exemplaire_id=exemplaire_id, statut="en_cours")
        .first()
    )
    if deja_reserve or emprunt_encours:
        raise ValueError("Exemplaire non disponible pour réservation")

    reservation = Reservation(adherent_id=adherent_id, exemplaire_id=exemplaire_id)
    session.add(reservation)
    session.commit()
    _rafraichir_disponibilite(session, exemplaire.ouvrage_isbn)
    return reservation


def emprunter(session: Session, adherent_id: int, exemplaire_id: int, jours: int = 14) -> Emprunt:
    if not session.get(Adherent, adherent_id):
        raise ValueError("Adhérent introuvable")

    exemplaire = session.get(Exemplaire, exemplaire_id)
    if not exemplaire:
        raise ValueError("Exemplaire introuvable")

    reserve = (
        session.query(Reservation)
        .filter_by(exemplaire_id=exemplaire_id, statut="active")
        .first()
    )
    emprunt_actif = (
        session.query(Emprunt).filter_by(exemplaire_id=exemplaire_id, statut="en_cours").first()
    )
    if reserve or emprunt_actif:
        raise ValueError("Exemplaire déjà réservé ou emprunté")

    date_retour_prevue = date.today() + timedelta(days=jours)
    emprunt = Emprunt(
        adherent_id=adherent_id,
        exemplaire_id=exemplaire_id,
        date_retour_prevue=date_retour_prevue,
        statut="en_cours",
    )
    session.add(emprunt)
    session.commit()
    _rafraichir_disponibilite(session, exemplaire.ouvrage_isbn)
    return emprunt


def retourner(session: Session, emprunt_id: int) -> Emprunt:
    emprunt = session.get(Emprunt, emprunt_id)
    if not emprunt:
        raise ValueError("Emprunt introuvable")
    emprunt.date_retour_effective = date.today()
    emprunt.statut = "cloture"
    session.commit()
    _rafraichir_disponibilite(session, emprunt.exemplaire.ouvrage_isbn)
    return emprunt


def calculer_penalite(emprunt: Emprunt, today: date | None = None) -> float:
    if not emprunt.date_retour_prevue:
        return 0.0
    today = today or date.today()
    effective = emprunt.date_retour_effective or today
    days_late = (effective - emprunt.date_retour_prevue).days
    return PENALTY_PER_DAY * max(0, days_late)


# Statistiques --------------------------------------------------------------

def top_lecteurs(session: Session, limit: int = 5) -> List[Tuple[str, int]]:
    rows = (
        session.query(Adherent, func.count(Emprunt.id).label("nb"))
        .join(Emprunt)
        .group_by(Adherent.id)
        .order_by(func.count(Emprunt.id).desc())
        .limit(limit)
        .all()
    )
    return [(
        f"{row[0].user.prenom} {row[0].user.nom}",
        row[1],
    ) for row in rows]


def rotation_ouvrages(session: Session, limit: int = 5) -> List[Tuple[str, int]]:
    rows = (
        session.query(Ouvrage.titre, func.count(Emprunt.id).label("nb"))
        .join(Exemplaire, Exemplaire.ouvrage_isbn == Ouvrage.isbn)
        .join(Emprunt, Emprunt.exemplaire_id == Exemplaire.id)
        .group_by(Ouvrage.titre)
        .order_by(func.count(Emprunt.id).desc())
        .limit(limit)
        .all()
    )
    return [(row[0], row[1]) for row in rows]


def retards_frequents(session: Session, limit: int = 5) -> List[Tuple[str, int]]:
    rows = (
        session.query(Ouvrage.titre, func.count(Emprunt.id))
        .join(Exemplaire, Exemplaire.ouvrage_isbn == Ouvrage.isbn)
        .join(Emprunt, Emprunt.exemplaire_id == Exemplaire.id)
        .filter(Emprunt.date_retour_effective > Emprunt.date_retour_prevue)
        .group_by(Ouvrage.titre)
        .order_by(func.count(Emprunt.id).desc())
        .limit(limit)
        .all()
    )
    return [(row[0], row[1]) for row in rows]
