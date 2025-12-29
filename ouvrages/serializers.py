# Role de ce fichier: serializers DRF pour ouvrages.
from rest_framework import serializers

from .models import Ouvrage


class OuvrageSerializer(serializers.ModelSerializer):
    # Sortie ouvrage + compteurs.
    exemplaires_total = serializers.IntegerField(read_only=True)
    exemplaires_disponibles = serializers.IntegerField(read_only=True)

    class Meta:
        model = Ouvrage
        fields = [
            "id",
            "isbn",
            "titre",
            "auteur",
            "editeur",
            "annee",
            "categorie",
            "type_ressource",
            "disponible",
            "exemplaires_total",
            "exemplaires_disponibles",
        ]


class OuvrageCreateSerializer(serializers.ModelSerializer):
    # Input creation ouvrage (+ nombre_exemplaires).
    nombre_exemplaires = serializers.IntegerField(required=False, min_value=0)

    class Meta:
        model = Ouvrage
        fields = [
            "isbn",
            "titre",
            "auteur",
            "editeur",
            "annee",
            "categorie",
            "type_ressource",
            "disponible",
            "nombre_exemplaires",
        ]


class OuvrageUpdateSerializer(serializers.ModelSerializer):
    # Input update ouvrage.
    class Meta:
        model = Ouvrage
        fields = ["isbn", "titre", "auteur", "editeur", "annee", "categorie", "type_ressource", "disponible"]
