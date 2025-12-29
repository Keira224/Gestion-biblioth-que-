# Role de ce fichier: modeles emprunts, penalites, reservations.
from django.db import models
from django.utils import timezone

from adherents.models import Adherent
from exemplaires.models import Exemplaire
from ouvrages.models import Ouvrage


class StatutEmprunt(models.TextChoices):
    # Statuts possibles d'un emprunt.
    EN_COURS = "EN_COURS", "En cours"
    RETOURNE = "RETOURNE", "Retourné"
    EN_RETARD = "EN_RETARD", "En retard"


class Emprunt(models.Model):
    # Enregistrement d'un emprunt.
    exemplaire = models.ForeignKey(
        Exemplaire,
        on_delete=models.PROTECT,
        related_name="emprunts",
    )
    adherent = models.ForeignKey(
        Adherent,
        on_delete=models.PROTECT,
        related_name="emprunts",
    )

    date_emprunt = models.DateField(auto_now_add=True)
    date_retour_prevue = models.DateField()

    date_retour_effective = models.DateField(blank=True, null=True)

    statut = models.CharField(
        max_length=20,
        choices=StatutEmprunt.choices,
        default=StatutEmprunt.EN_COURS,
    )

    def __str__(self):
        return f"Emprunt #{self.id} - {self.exemplaire.code_barre}"

    # -----------------------------
    # Retards (calcul automatique)
    # -----------------------------
    def date_reference_retour(self):
        """
        Si rendu => date_retour_effective, sinon => date du jour.
        """
        return self.date_retour_effective or timezone.localdate()

    def jours_de_retard(self) -> int:
        ref = self.date_reference_retour()
        if ref <= self.date_retour_prevue:
            return 0
        return (ref - self.date_retour_prevue).days

    def est_en_retard(self) -> bool:
        return self.jours_de_retard() > 0


class Penalite(models.Model):
    # Penalite liee a un emprunt en retard.
    emprunt = models.OneToOneField(
        Emprunt,
        on_delete=models.CASCADE,
        related_name="penalite",
    )
    jours_retard = models.PositiveIntegerField()
    montant = models.DecimalField(max_digits=10, decimal_places=2)

    payee = models.BooleanField(default=False)
    date_creation = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"Penalite Emprunt #{self.emprunt_id} - {self.montant}"


class StatutReservation(models.TextChoices):
    # Statuts possibles d'une reservation.
    EN_ATTENTE = "EN_ATTENTE", "En attente"
    ANNULEE = "ANNULEE", "Annulee"
    HONOREE = "HONOREE", "Honoree"


class Reservation(models.Model):
    # Reservation d'un ouvrage par un lecteur.
    adherent = models.ForeignKey(
        Adherent,
        on_delete=models.CASCADE,
        related_name="reservations",
    )
    ouvrage = models.ForeignKey(
        Ouvrage,
        on_delete=models.CASCADE,
        related_name="reservations",
    )
    statut = models.CharField(
        max_length=20,
        choices=StatutReservation.choices,
        default=StatutReservation.EN_ATTENTE,
    )
    date_creation = models.DateTimeField(auto_now_add=True)
    date_traitement = models.DateTimeField(blank=True, null=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["adherent", "ouvrage"],
                condition=models.Q(statut=StatutReservation.EN_ATTENTE),
                name="unique_active_reservation",
            ),
        ]

    def __str__(self):
        return f"Reservation {self.ouvrage.titre} - {self.adherent.user.username}"
