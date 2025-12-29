# Role de ce fichier: configuration admin emprunts.
from django.contrib import admin

from .models import Emprunt, Penalite, Reservation


@admin.register(Emprunt)
class EmpruntAdmin(admin.ModelAdmin):
    # Admin: gestion des emprunts.
    list_display = ("id", "exemplaire", "adherent", "date_emprunt", "date_retour_prevue", "date_retour_effective", "statut")
    search_fields = ("exemplaire__code_barre", "adherent__user__username")
    list_filter = ("statut",)


@admin.register(Penalite)
class PenaliteAdmin(admin.ModelAdmin):
    # Admin: gestion des penalites.
    list_display = ("id", "emprunt", "jours_retard", "montant", "payee", "date_creation")
    list_filter = ("payee",)


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    # Admin: reservations d'ouvrages.
    list_display = ("id", "ouvrage", "adherent", "statut", "date_creation", "date_traitement")
    list_filter = ("statut",)
