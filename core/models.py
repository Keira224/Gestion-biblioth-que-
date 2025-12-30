# Role de ce fichier: modele et helpers de base (parametres systeme, activites).
from typing import Optional

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import models

class Parametre(models.Model):
    # Parametres systeme: penalites, duree, quota emprunts.
    tarif_penalite_par_jour = models.DecimalField(max_digits=10, decimal_places=2, default=1000.00)
    tarif_reservation_par_jour = models.DecimalField(max_digits=10, decimal_places=2, default=1000.00)
    duree_emprunt_jours = models.PositiveIntegerField(default=14)
    quota_emprunts_actifs = models.PositiveIntegerField(default=3)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return "Paramètres système"


class ActivityType(models.TextChoices):
    # Types d'activites pour le journal systeme.
    EMPRUNT_CREE = "EMPRUNT_CREE", "Emprunt cree"
    RETOUR_ENREGISTRE = "RETOUR_ENREGISTRE", "Retour enregistre"
    PENALITE_CREE = "PENALITE_CREE", "Penalite creee"
    PENALITE_PAYEE = "PENALITE_PAYEE", "Penalite payee"
    OUVRAGE_AJOUTE = "OUVRAGE_AJOUTE", "Ouvrage ajoute"
    EXEMPLAIRE_AJOUTE = "EXEMPLAIRE_AJOUTE", "Exemplaire ajoute"
    USER_CREATED = "USER_CREATED", "Utilisateur cree"
    USER_UPDATED = "USER_UPDATED", "Utilisateur modifie"
    USER_DISABLED = "USER_DISABLED", "Utilisateur desactive"
    PASSWORD_RESET = "PASSWORD_RESET", "Mot de passe reinitialise"


class Activity(models.Model):
    # Journal d'activites: evenement + message + user associe.
    type = models.CharField(max_length=40, choices=ActivityType.choices)
    message = models.CharField(max_length=255)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="activities",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.type} - {self.message}"


class TypePaiement(models.TextChoices):
    EBOOK = "EBOOK", "Ebook"
    RESERVATION = "RESERVATION", "Reservation"
    PENALITE = "PENALITE", "Penalite"


class StatutPaiement(models.TextChoices):
    INITIE = "INITIE", "Initie"
    PAYE = "PAYE", "Paye"
    ANNULE = "ANNULE", "Annule"


class Paiement(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="paiements",
    )
    type = models.CharField(max_length=20, choices=TypePaiement.choices)
    reference_objet = models.PositiveIntegerField()
    montant = models.DecimalField(max_digits=10, decimal_places=2)
    statut = models.CharField(
        max_length=20,
        choices=StatutPaiement.choices,
        default=StatutPaiement.INITIE,
    )
    date_paiement = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"Paiement {self.type} #{self.reference_objet} - {self.statut}"


class Message(models.Model):
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="messages_envoyes",
    )
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="messages_recus",
    )
    contenu = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message {self.sender_id} -> {self.recipient_id or 'staff'}"


User = get_user_model()


# Helper: enregistre une activite systeme.
def log_activity(*, type: str, message: str, user: Optional[User] = None) -> Activity:
    # Permissions: gerees par les vues qui appellent cette fonction.
    return Activity.objects.create(type=type, message=message, user=user)
