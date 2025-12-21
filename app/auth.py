"""Authentication helpers using bcrypt hashing."""
from __future__ import annotations

from passlib.hash import bcrypt
from sqlalchemy.orm import Session

from .db import Adherent, User


def create_user(
    session: Session,
    login: str,
    password: str,
    role: str,
    nom: str,
    prenom: str,
    email: str,
    adherent_data: dict | None = None,
) -> User:
    user = User(
        login=login,
        password=bcrypt.hash(password),
        role=role,
        nom=nom,
        prenom=prenom,
        email=email,
    )
    if role == "Lecteur":
        adherent = Adherent(user=user, **(adherent_data or {}))
        session.add(adherent)
    session.add(user)
    session.commit()
    return user


def authenticate(session: Session, login: str, password: str) -> User | None:
    user = session.query(User).filter_by(login=login).first()
    if user and bcrypt.verify(password, user.password):
        return user
    return None
