# Role de ce fichier: modele Exemplaire + helpers.
from uuid import uuid4

from django.db import models
from ouvrages.models import Ouvrage


class EtatExemplaire(models.TextChoices):
    # Etats possibles d'un exemplaire.
    DISPONIBLE = "DISPONIBLE", "Disponible"
    EMPRUNTE = "EMPRUNTE", "Emprunté"
    PERDU = "PERDU", "Perdu"
    ENDOMMAGE = "ENDOMMAGE", "Endommagé"


class Exemplaire(models.Model):
    # Exemplaire physique associe a un ouvrage.
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


def generate_code_barre(ouvrage_id: int) -> str:
    # Helper: genere un code unique pour un exemplaire.
    while True:
        code = f"EX-{ouvrage_id}-{uuid4().hex[:8]}"
        if not Exemplaire.objects.filter(code_barre=code).exists():
            return code
