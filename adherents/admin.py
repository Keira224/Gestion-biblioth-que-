# Role de ce fichier: configuration admin adherents.
from django.contrib import admin

from .models import Adherent


@admin.register(Adherent)
class AdherentAdmin(admin.ModelAdmin):
    # Admin: afficher adherents et coordonnees.
    list_display = ("id", "user", "telephone", "adresse", "date_inscription")
    search_fields = ("user__username", "user__email", "telephone")
