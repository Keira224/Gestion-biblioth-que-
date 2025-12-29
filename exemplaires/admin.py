# Role de ce fichier: configuration admin exemplaires.
from django.contrib import admin

from .models import Exemplaire


@admin.register(Exemplaire)
class ExemplaireAdmin(admin.ModelAdmin):
    # Admin: liste et filtre des exemplaires.
    list_display = ("id", "code_barre", "ouvrage", "etat")
    search_fields = ("code_barre", "ouvrage__titre", "ouvrage__isbn")
    list_filter = ("etat",)
