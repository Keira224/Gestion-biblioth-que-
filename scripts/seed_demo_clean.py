from datetime import timedelta
import os
import sys

import django
from django.contrib.auth import get_user_model
from django.utils import timezone


def main():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    sys.path.append(base_dir)
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
    django.setup()

    from adherents.models import Adherent
    from emprunts.models import Emprunt, Penalite, Reservation, StatutEmprunt, StatutReservation
    from exemplaires.models import EtatExemplaire, Exemplaire
    from ouvrages.models import Ouvrage, TypeRessource
    from users.models import UserProfile, UserRole

    def get_or_create_user(username, email, password):
        user_model = get_user_model()
        user, created = user_model.objects.get_or_create(
            username=username,
            defaults={"email": email, "is_active": True},
        )
        if created or not user.check_password(password):
            user.set_password(password)
        if user.email != email:
            user.email = email
        user.is_active = True
        user.save(update_fields=["password", "email", "is_active"])
        return user

    def set_role(user, role):
        profile, _ = UserProfile.objects.get_or_create(user=user)
        if profile.role != role:
            profile.role = role
            profile.save(update_fields=["role"])

    # Users
    admin = get_or_create_user("admin", "admin@biblio.test", "Admin123!")
    admin.is_staff = True
    admin.is_superuser = True
    admin.save(update_fields=["is_staff", "is_superuser"])
    set_role(admin, UserRole.ADMIN)

    biblio = get_or_create_user("biblio", "biblio@biblio.test", "Biblio123!")
    set_role(biblio, UserRole.BIBLIOTHECAIRE)

    lecteur = get_or_create_user("lecteur", "lecteur@biblio.test", "Lecteur123!")
    set_role(lecteur, UserRole.LECTEUR)

    Adherent.objects.get_or_create(
        user=lecteur,
        defaults={
            "adresse": "12 rue des Livres, Casablanca",
            "telephone": "0612345678",
            "cotisation": 50.00,
        },
    )

    # Ouvrages
    ouvrages_data = [
        {
            "isbn": "9780000000001",
            "titre": "Introduction a la bibliotheconomie",
            "auteur": "S. Karim",
            "editeur": "Editions Atlas",
            "annee": 2020,
            "categorie": "Gestion",
            "type_ressource": TypeRessource.LIVRE,
        },
        {
            "isbn": "9780000000002",
            "titre": "Python pour les bibliotheques",
            "auteur": "N. Laila",
            "editeur": "Code & Livre",
            "annee": 2022,
            "categorie": "Informatique",
            "type_ressource": TypeRessource.LIVRE,
        },
        {
            "isbn": "9780000000003",
            "titre": "Culture generale - DVD",
            "auteur": "DocuLab",
            "editeur": "MediaLab",
            "annee": 2019,
            "categorie": "Culture",
            "type_ressource": TypeRessource.DVD,
        },
        {
            "isbn": "9780000000004",
            "titre": "Ressource numerique - Archives",
            "auteur": "Bibliotheque Centrale",
            "editeur": "ArchiveNet",
            "annee": 2021,
            "categorie": "Archives",
            "type_ressource": TypeRessource.RESSOURCE_NUMERIQUE,
        },
    ]
    ouvrages = []
    for data in ouvrages_data:
        ouvrage, _ = Ouvrage.objects.get_or_create(isbn=data["isbn"], defaults=data)
        ouvrages.append(ouvrage)

    # Exemplaires
    for idx, ouvrage in enumerate(ouvrages, start=1):
        for copy_index in range(1, 4):
            code_barre = f"EX-{idx}-{copy_index}"
            Exemplaire.objects.get_or_create(
                code_barre=code_barre,
                defaults={"ouvrage": ouvrage, "etat": EtatExemplaire.DISPONIBLE},
            )

    # Emprunts + penalites
    adherent = lecteur.adherent
    today = timezone.localdate()
    exemplaire_emprunt = Exemplaire.objects.filter(etat=EtatExemplaire.DISPONIBLE).first()
    if exemplaire_emprunt:
        Emprunt.objects.get_or_create(
            exemplaire=exemplaire_emprunt,
            adherent=adherent,
            defaults={
                "date_retour_prevue": today + timedelta(days=7),
                "statut": StatutEmprunt.EN_COURS,
            },
        )
        exemplaire_emprunt.etat = EtatExemplaire.EMPRUNTE
        exemplaire_emprunt.save(update_fields=["etat"])

    exemplaire_retour = Exemplaire.objects.exclude(
        id=getattr(exemplaire_emprunt, "id", None)
    ).first()
    if exemplaire_retour:
        emprunt_retour, _ = Emprunt.objects.get_or_create(
            exemplaire=exemplaire_retour,
            adherent=adherent,
            defaults={
                "date_retour_prevue": today - timedelta(days=5),
                "date_retour_effective": today - timedelta(days=1),
                "statut": StatutEmprunt.RETOURNE,
            },
        )
        exemplaire_retour.etat = EtatExemplaire.DISPONIBLE
        exemplaire_retour.save(update_fields=["etat"])
        Penalite.objects.get_or_create(
            emprunt=emprunt_retour,
            defaults={"jours_retard": 4, "montant": 20.00, "payee": False},
        )

    # Reservation
    ouvrage_reserve = Ouvrage.objects.exclude(
        id=getattr(exemplaire_emprunt, "ouvrage_id", None)
    ).first()
    if ouvrage_reserve:
        Reservation.objects.get_or_create(
            adherent=adherent,
            ouvrage=ouvrage_reserve,
            defaults={"statut": StatutReservation.EN_ATTENTE},
        )

    print("Seed demo termine.")


if __name__ == "__main__":
    main()
