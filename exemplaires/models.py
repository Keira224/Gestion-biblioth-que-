from django.db import models
from ouvrages.models import Ouvrage


class EtatExemplaire(models.TextChoices):
    DISPONIBLE = "DISPONIBLE", "Disponible"
    EMPRUNTE = "EMPRUNTE", "Emprunté"
    PERDU = "PERDU", "Perdu"
    ENDOMMAGE = "ENDOMMAGE", "Endommagé"


class Exemplaire(models.Model):
    ouvrage = models.ForeignKey(
        Ouvrage,
        on_delete=models.CASCADE,
        related_name="exemplaires"
    )

    code_barre = models.CharField(
        max_length=50,
        unique=True
    )

    etat = models.CharField(
        max_length=20,
        choices=EtatExemplaire.choices,
        default=EtatExemplaire.DISPONIBLE
    )

    def __str__(self):
        return f"{self.code_barre} - {self.ouvrage.titre}"
