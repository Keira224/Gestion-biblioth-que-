# Role de ce fichier: configuration admin ouvrages.
from django.contrib import admin

from .models import Ouvrage


@admin.register(Ouvrage)
class OuvrageAdmin(admin.ModelAdmin):
    # Admin: liste et recherche ouvrages.
    list_display = ("id", "titre", "auteur", "isbn", "categorie", "type_ressource", "disponible")
    search_fields = ("titre", "auteur", "isbn")
    list_filter = ("categorie", "type_ressource", "disponible")
