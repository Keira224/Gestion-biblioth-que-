from django.conf import settings
from django.db import models

class Parametre(models.Model):
    tarif_penalite_par_jour = models.DecimalField(max_digits=10, decimal_places=2, default=1000.00)
    duree_emprunt_jours = models.PositiveIntegerField(default=14)
    quota_emprunts_actifs = models.PositiveIntegerField(default=3)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return "Paramètres système"


class ActivityType(models.TextChoices):
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
