# Role de ce fichier: modele Adherent (lecteur).
from django.conf import settings
from django.db import models


class Adherent(models.Model):
    # Profil lecteur associe a un user.
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="adherent"
    )

    adresse = models.CharField(max_length=255)
    telephone = models.CharField(max_length=20)

    date_inscription = models.DateField(auto_now_add=True)

    cotisation = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00
    )

    def __str__(self):
        return f"Adhérent : {self.user.username}"
