from datetime import timedelta
import base64
import os
import sys

import django
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.files.base import ContentFile


def main():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    sys.path.append(base_dir)
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.dev")
    django.setup()

    from adherents.models import Adherent
    from emprunts.models import Emprunt, Penalite, Reservation, StatutEmprunt, StatutReservation
    from exemplaires.models import EtatExemplaire, Exemplaire
    from ouvrages.models import Ouvrage, TypeRessource, Ebook, FormatEbook, DemandeLivre, StatutDemandeLivre
    from users.models import UserProfile, UserRole
    from core.models import Paiement, TypePaiement, StatutPaiement

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

    # Users (5 par role)
    admins = []
    biblios = []
    lecteurs = []
    for idx in range(1, 6):
        admin = get_or_create_user(f"admin{idx}", f"admin{idx}@biblio.test", "Admin123!")
        admin.is_staff = True
        admin.is_superuser = idx == 1
        admin.save(update_fields=["is_staff", "is_superuser"])
        set_role(admin, UserRole.ADMIN)
        admins.append(admin)

        biblio = get_or_create_user(f"biblio{idx}", f"biblio{idx}@biblio.test", "Biblio123!")
        set_role(biblio, UserRole.BIBLIOTHECAIRE)
        biblios.append(biblio)

        lecteur = get_or_create_user(f"lecteur{idx}", f"lecteur{idx}@biblio.test", "Lecteur123!")
        set_role(lecteur, UserRole.LECTEUR)
        lecteurs.append(lecteur)

        Adherent.objects.get_or_create(
            user=lecteur,
            defaults={
                "adresse": f"{10 + idx} rue des Livres, Casablanca",
                "telephone": f"06123456{70 + idx}",
                "cotisation": 50.00 + idx,
            },
        )

    # Ouvrages (10)
    base_image = base64.b64decode(
        "iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAI0lEQVQoU2NkYGD4z0AEYBxVSFQG"
        "YQxkGhgYGADt3Q1U6Gf5gQAAAABJRU5ErkJggg=="
    )
    ouvrages_data = []
    categories = ["Gestion", "Informatique", "Culture", "Archives", "Management"]
    auteurs = ["S. Karim", "N. Laila", "DocuLab", "Bibliotheque Centrale", "M. Diallo"]
    titres = [
        "Introduction a la bibliotheconomie",
        "Python pour les bibliotheques",
        "Culture generale - DVD",
        "Ressource numerique - Archives",
        "Gestion documentaire avancee",
        "Histoire des bibliotheques",
        "Veille documentaire moderne",
        "Archivage et preservation",
        "Strategie numerique",
        "Mediation culturelle",
    ]
    for idx in range(10):
        ouvrages_data.append(
            {
                "isbn": f"97800000000{10 + idx}",
                "titre": titres[idx],
                "auteur": auteurs[idx % len(auteurs)],
                "editeur": "Editions Atlas",
                "annee": 2018 + idx,
                "categorie": categories[idx % len(categories)],
                "type_ressource": TypeRessource.LIVRE if idx % 3 == 0 else TypeRessource.DVD if idx % 3 == 1 else TypeRessource.RESSOURCE_NUMERIQUE,
                "description_courte": "Description courte pour faciliter la decouverte de l'ouvrage.",
            }
        )
    ouvrages = []
    for data in ouvrages_data:
        ouvrage, _ = Ouvrage.objects.get_or_create(isbn=data["isbn"], defaults=data)
        if not ouvrage.image:
            ouvrage.image.save(f"ouvrage_{ouvrage.isbn}.png", ContentFile(base_image), save=True)
        ouvrages.append(ouvrage)

    # Exemplaires (20)
    for idx, ouvrage in enumerate(ouvrages, start=1):
        for copy_index in range(1, 3):
            code_barre = f"EX-{idx}-{copy_index}"
            Exemplaire.objects.get_or_create(
                code_barre=code_barre,
                defaults={"ouvrage": ouvrage, "etat": EtatExemplaire.DISPONIBLE},
            )

    # Emprunts + penalites (10)
    adherent = lecteurs[0].adherent
    today = timezone.localdate()
    disponibles = list(Exemplaire.objects.filter(etat=EtatExemplaire.DISPONIBLE)[:10])
    for idx, exemplaire in enumerate(disponibles, start=1):
        lecteur = lecteurs[idx % len(lecteurs)]
        statut = StatutEmprunt.EN_COURS if idx % 2 == 0 else StatutEmprunt.RETOURNE
        emprunt, _ = Emprunt.objects.get_or_create(
            exemplaire=exemplaire,
            adherent=lecteur.adherent,
            defaults={
                "date_retour_prevue": today + timedelta(days=7 - idx),
                "date_retour_effective": None if statut == StatutEmprunt.EN_COURS else today - timedelta(days=1),
                "statut": statut,
            },
        )
        if statut == StatutEmprunt.EN_COURS:
            exemplaire.etat = EtatExemplaire.EMPRUNTE
            exemplaire.save(update_fields=["etat"])
        if idx % 3 == 0:
            Penalite.objects.get_or_create(
                emprunt=emprunt,
                defaults={"jours_retard": idx, "montant": 20.00 + idx, "payee": idx % 2 == 0},
            )

    # Reservations (10)
    for idx, ouvrage in enumerate(ouvrages[:10], start=1):
        Reservation.objects.get_or_create(
            adherent=lecteurs[idx % len(lecteurs)].adherent,
            ouvrage=ouvrage,
            date_debut=today + timedelta(days=idx),
            date_fin=today + timedelta(days=idx + 3),
            defaults={
                "statut": [StatutReservation.EN_ATTENTE, StatutReservation.VALIDEE, StatutReservation.REFUSEE][idx % 3],
                "montant_estime": 2000.00 + idx * 100,
            },
        )

    # Demandes de livres (10)
    for idx in range(1, 11):
        DemandeLivre.objects.get_or_create(
            adherent=lecteurs[idx % len(lecteurs)].adherent,
            titre=f"Demande livre {idx}",
            defaults={
                "auteur": f"Auteur {idx}",
                "isbn": f"97899999999{10 + idx}",
                "description": "Livre introuvable dans le catalogue.",
                "urgence": "Haute" if idx % 2 == 0 else "Moyenne",
                "statut": StatutDemandeLivre.EN_ATTENTE if idx % 2 == 0 else StatutDemandeLivre.EN_RECHERCHE,
            },
        )

    # Ebooks (10)
    ebooks = []
    for idx in range(1, 11):
        ebook, _ = Ebook.objects.get_or_create(
            nom_fichier=f"Ebook {idx}.pdf",
            defaults={
                "ouvrage": ouvrages[idx % len(ouvrages)] if ouvrages else None,
                "format": FormatEbook.PDF if idx % 2 == 0 else FormatEbook.EPUB,
                "taille": 1024 + idx * 100,
                "est_payant": idx % 2 == 0,
                "prix": 10000.00 + idx * 500 if idx % 2 == 0 else None,
                "url_fichier": f"https://example.com/ebook-{idx}.pdf",
            },
        )
        ebooks.append(ebook)

    # Paiements (10)
    for idx, ebook in enumerate(ebooks, start=1):
        Paiement.objects.get_or_create(
            user=lecteurs[idx % len(lecteurs)],
            type=TypePaiement.EBOOK,
            reference_objet=ebook.id,
            defaults={
                "montant": 10000.00 + idx * 500,
                "statut": StatutPaiement.PAYE if idx % 2 == 0 else StatutPaiement.INITIE,
                "date_paiement": timezone.now(),
            },
        )

    print("Seed demo termine.")


if __name__ == "__main__":
    main()
