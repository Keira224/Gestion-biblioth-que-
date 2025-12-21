"""Database models and session utilities for the library system."""
from __future__ import annotations

import os
from datetime import datetime
from typing import Optional

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    create_engine,
    func,
)
from sqlalchemy.orm import declarative_base, relationship, sessionmaker

Base = declarative_base()


class User(Base):
    __tablename__ = "utilisateurs"

    id = Column(Integer, primary_key=True)
    login = Column(String(50), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False)  # Admin, Bibliothecaire, Lecteur
    nom = Column(String(100), nullable=False)
    prenom = Column(String(100), nullable=False)
    email = Column(String(120), nullable=False)

    adherent = relationship("Adherent", uselist=False, back_populates="user")


class Adherent(Base):
    __tablename__ = "adherents"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("utilisateurs.id"), nullable=False)
    adresse = Column(String(200))
    telephone = Column(String(30))
    date_inscription = Column(Date, default=func.current_date())
    cotisation = Column(Boolean, default=True)

    user = relationship("User", back_populates="adherent")
    emprunts = relationship("Emprunt", back_populates="adherent")
    reservations = relationship("Reservation", back_populates="adherent")


class Ouvrage(Base):
    __tablename__ = "ouvrages"

    isbn = Column(String(20), primary_key=True)
    titre = Column(String(200), nullable=False)
    auteur = Column(String(200))
    editeur = Column(String(120))
    annee = Column(Integer)
    categorie = Column(String(100))
    disponible = Column(Boolean, default=True)

    exemplaires = relationship("Exemplaire", back_populates="ouvrage")


class Exemplaire(Base):
    __tablename__ = "exemplaires"

    id = Column(Integer, primary_key=True)
    ouvrage_isbn = Column(String(20), ForeignKey("ouvrages.isbn"), nullable=False)
    code_barre = Column(String(50), unique=True, nullable=False)
    etat = Column(String(50), default="bon")

    ouvrage = relationship("Ouvrage", back_populates="exemplaires")
    emprunts = relationship("Emprunt", back_populates="exemplaire")
    reservations = relationship("Reservation", back_populates="exemplaire")


class Emprunt(Base):
    __tablename__ = "emprunts"

    id = Column(Integer, primary_key=True)
    exemplaire_id = Column(Integer, ForeignKey("exemplaires.id"), nullable=False)
    adherent_id = Column(Integer, ForeignKey("adherents.id"), nullable=False)
    date_emprunt = Column(DateTime, default=datetime.utcnow)
    date_retour_prevue = Column(Date)
    date_retour_effective = Column(Date)
    statut = Column(String(30), default="en_cours")

    exemplaire = relationship("Exemplaire", back_populates="emprunts")
    adherent = relationship("Adherent", back_populates="emprunts")


class Reservation(Base):
    __tablename__ = "reservations"

    id = Column(Integer, primary_key=True)
    exemplaire_id = Column(Integer, ForeignKey("exemplaires.id"), nullable=False)
    adherent_id = Column(Integer, ForeignKey("adherents.id"), nullable=False)
    date_reservation = Column(DateTime, default=datetime.utcnow)
    statut = Column(String(30), default="active")

    exemplaire = relationship("Exemplaire", back_populates="reservations")
    adherent = relationship("Adherent", back_populates="reservations")


DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///library.db")

engine = create_engine(DATABASE_URL, echo=False, future=True)
SessionLocal = sessionmaker(bind=engine)


def init_db(drop_existing: bool = False) -> None:
    """Create database tables and optionally reset the schema."""
    if drop_existing:
        Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)


# Demo seeding helpers -----------------------------------------------------
from passlib.hash import bcrypt  # noqa: E402

def seed_demo(session: SessionLocal) -> None:
    """Populate the database with a few demo records for the UI."""
    if session.query(User).count():
        return

    admin = User(
        login="admin",
        password=bcrypt.hash("admin123"),
        role="Admin",
        nom="Admin",
        prenom="A.",
        email="admin@example.com",
    )
    bibliothecaire = User(
        login="biblio",
        password=bcrypt.hash("biblio123"),
        role="Bibliothecaire",
        nom="Bibli",
        prenom="Theo",
        email="biblio@example.com",
    )
    lecteur_user = User(
        login="lecteur",
        password=bcrypt.hash("lecteur123"),
        role="Lecteur",
        nom="Lecteur",
        prenom="Lucie",
        email="lecteur@example.com",
    )

    adherent = Adherent(
        user=lecteur_user,
        adresse="10 rue des Livres",
        telephone="0102030405",
    )

    ouvrage = Ouvrage(
        isbn="978-1234567890",
        titre="Introduction à Python",
        auteur="A. Auteur",
        editeur="Presses Universitaires",
        annee=2023,
        categorie="Informatique",
    )
    exemplaire1 = Exemplaire(ouvrage=ouvrage, code_barre="CB001")
    exemplaire2 = Exemplaire(ouvrage=ouvrage, code_barre="CB002")

    session.add_all([admin, bibliothecaire, lecteur_user, adherent, ouvrage, exemplaire1, exemplaire2])
    session.commit()


def get_session():
    return SessionLocal()
