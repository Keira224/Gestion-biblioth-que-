from django.contrib import admin
from .models import Emprunt, Penalite


@admin.register(Emprunt)
class EmpruntAdmin(admin.ModelAdmin):
    list_display = ("id", "exemplaire", "adherent", "date_emprunt", "date_retour_prevue", "date_retour_effective", "statut")
    list_filter = ("statut",)
    search_fields = ("exemplaire__code_barre", "adherent__user__username")


@admin.register(Penalite)
class PenaliteAdmin(admin.ModelAdmin):
    list_display = ("id", "emprunt", "jours_retard", "montant", "payee", "date_creation")
    list_filter = ("payee",)
