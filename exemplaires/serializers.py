# Role de ce fichier: serializers DRF pour exemplaires.
from rest_framework import serializers

from .models import Exemplaire


class ExemplaireDisponibleSerializer(serializers.ModelSerializer):
    # Sortie exemplaire disponible (avec infos ouvrage).
    ouvrage_titre = serializers.CharField(source="ouvrage.titre", read_only=True)
    ouvrage_auteur = serializers.CharField(source="ouvrage.auteur", read_only=True)
    ouvrage_isbn = serializers.CharField(source="ouvrage.isbn", read_only=True)
    code_barre_image = serializers.ImageField(read_only=True)

    class Meta:
        model = Exemplaire
        fields = [
            "id",
            "code_barre",
            "code_barre_image",
            "etat",
            "ouvrage_titre",
            "ouvrage_auteur",
            "ouvrage_isbn",
        ]


class ExemplaireSerializer(serializers.ModelSerializer):
    # Sortie exemplaire complet (admin/biblio).
    ouvrage_titre = serializers.CharField(source="ouvrage.titre", read_only=True)
    emprunts_count = serializers.IntegerField(read_only=True)
    code_barre_image = serializers.ImageField(read_only=True)

    class Meta:
        model = Exemplaire
        fields = [
            "id",
            "code_barre",
            "code_barre_image",
            "etat",
            "ouvrage",
            "ouvrage_titre",
            "emprunts_count",
        ]
