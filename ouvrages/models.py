# Role de ce fichier: modele Ouvrage et type de ressource.
from django.db import models


class TypeRessource(models.TextChoices):
    # Type de support dans le catalogue.
    LIVRE = "LIVRE", "Livre"
    DVD = "DVD", "DVD"
    RESSOURCE_NUMERIQUE = "RESSOURCE_NUMERIQUE", "Ressource numerique"


class Ouvrage(models.Model):
    # Ouvrage du catalogue (livre, dvd, ressource numerique).
    isbn = models.CharField(
        max_length=20,
        unique=True,
        verbose_name="ISBN"
    )
    titre = models.CharField(
        max_length=255
    )
    auteur = models.CharField(
        max_length=255
    )
    editeur = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )
    annee = models.PositiveIntegerField(
        blank=True,
        null=True
    )
    categorie = models.CharField(
        max_length=100
    )
    type_ressource = models.CharField(
        max_length=30,
        choices=TypeRessource.choices,
        default=TypeRessource.LIVRE,
    )
    disponible = models.BooleanField(
        default=True
    )

    def __str__(self):
        return f"{self.titre} ({self.isbn})"
