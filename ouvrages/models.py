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


class StatutDemandeLivre(models.TextChoices):
    EN_ATTENTE = "EN_ATTENTE", "En attente"
    EN_RECHERCHE = "EN_RECHERCHE", "En recherche"
    TROUVE = "TROUVE", "Trouve"
    INDISPONIBLE = "INDISPONIBLE", "Indisponible"
    CLOTUREE = "CLOTUREE", "Cloturee"


class DemandeLivre(models.Model):
    adherent = models.ForeignKey(
        "adherents.Adherent",
        on_delete=models.CASCADE,
        related_name="demandes_livres",
    )
    titre = models.CharField(max_length=255)
    auteur = models.CharField(max_length=255, blank=True, null=True)
    isbn = models.CharField(max_length=20, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    urgence = models.CharField(max_length=50, blank=True, null=True)
    statut = models.CharField(
        max_length=20,
        choices=StatutDemandeLivre.choices,
        default=StatutDemandeLivre.EN_ATTENTE,
    )
    ouvrage = models.ForeignKey(
        Ouvrage,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="demandes",
    )
    date_creation = models.DateTimeField(auto_now_add=True)
    date_traitement = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"Demande {self.titre} - {self.adherent.user.username}"


class FormatEbook(models.TextChoices):
    PDF = "PDF", "PDF"
    EPUB = "EPUB", "EPUB"


class Ebook(models.Model):
    ouvrage = models.ForeignKey(
        Ouvrage,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="ebooks",
    )
    fichier = models.FileField(upload_to="ebooks/", blank=True, null=True)
    url_fichier = models.URLField(blank=True, null=True)
    format = models.CharField(max_length=10, choices=FormatEbook.choices)
    taille = models.PositiveIntegerField(blank=True, null=True)
    nom_fichier = models.CharField(max_length=255)
    est_payant = models.BooleanField(default=False)
    prix = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    date_ajout = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Ebook {self.nom_fichier}"
