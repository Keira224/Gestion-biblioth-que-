# Role de ce fichier: configuration admin pour core.
from django.contrib import admin

from .models import Activity, Parametre


@admin.register(Parametre)
class ParametreAdmin(admin.ModelAdmin):
    # Admin: parametres systeme (unique).
    list_display = ("id", "tarif_penalite_par_jour", "duree_emprunt_jours", "quota_emprunts_actifs", "updated_at")


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    # Admin: journal d'activites.
    list_display = ("id", "type", "message", "user", "created_at")
    search_fields = ("message", "user__username")
    list_filter = ("type",)
