# Role de ce fichier: serializers DRF pour ouvrages.
import re
from rest_framework import serializers

from .models import Ouvrage
from .models import DemandeLivre, Ebook


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
            "image",
            "description_courte",
            "exemplaires_total",
            "exemplaires_disponibles",
        ]


class OuvrageCreateSerializer(serializers.ModelSerializer):
    # Input creation ouvrage (+ nombre_exemplaires).
    nombre_exemplaires = serializers.IntegerField(required=False, min_value=0)

    def validate_isbn(self, value: str):
        raw = value or ""
        normalized = re.sub(r"[-\s]", "", raw).upper()
        if len(normalized) not in {10, 13}:
            raise serializers.ValidationError("ISBN invalide (10 ou 13 caracteres requis).")
        if len(normalized) == 10:
            if not re.fullmatch(r"\d{9}[\dX]", normalized):
                raise serializers.ValidationError("ISBN-10 invalide (9 chiffres + chiffre ou X).")
        if len(normalized) == 13 and not normalized.isdigit():
            raise serializers.ValidationError("ISBN-13 invalide (13 chiffres).")
        return normalized

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
            "image",
            "description_courte",
            "nombre_exemplaires",
        ]


class OuvrageUpdateSerializer(serializers.ModelSerializer):
    # Input update ouvrage.
    def validate_isbn(self, value: str):
        raw = value or ""
        normalized = re.sub(r"[-\s]", "", raw).upper()
        if len(normalized) not in {10, 13}:
            raise serializers.ValidationError("ISBN invalide (10 ou 13 caracteres requis).")
        if len(normalized) == 10:
            if not re.fullmatch(r"\d{9}[\dX]", normalized):
                raise serializers.ValidationError("ISBN-10 invalide (9 chiffres + chiffre ou X).")
        if len(normalized) == 13 and not normalized.isdigit():
            raise serializers.ValidationError("ISBN-13 invalide (13 chiffres).")
        return normalized

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
            "image",
            "description_courte",
        ]


class DemandeLivreSerializer(serializers.ModelSerializer):
    adherent_username = serializers.CharField(source="adherent.user.username", read_only=True)

    class Meta:
        model = DemandeLivre
        fields = [
            "id",
            "titre",
            "auteur",
            "isbn",
            "description",
            "urgence",
            "statut",
            "ouvrage",
            "adherent",
            "adherent_username",
            "date_creation",
            "date_traitement",
        ]


class DemandeLivreCreateSerializer(serializers.ModelSerializer):
    def validate_isbn(self, value: str):
        if not value:
            return value
        raw = value or ""
        normalized = re.sub(r"[-\s]", "", raw).upper()
        if len(normalized) not in {10, 13}:
            raise serializers.ValidationError("ISBN invalide (10 ou 13 caracteres requis).")
        if len(normalized) == 10:
            if not re.fullmatch(r"\d{9}[\dX]", normalized):
                raise serializers.ValidationError("ISBN-10 invalide (9 chiffres + chiffre ou X).")
        if len(normalized) == 13 and not normalized.isdigit():
            raise serializers.ValidationError("ISBN-13 invalide (13 chiffres).")
        return normalized

    class Meta:
        model = DemandeLivre
        fields = ["titre", "auteur", "isbn", "description", "urgence"]


class DemandeLivreStatusSerializer(serializers.Serializer):
    statut = serializers.ChoiceField(choices=DemandeLivre._meta.get_field("statut").choices)
    ouvrage_id = serializers.IntegerField(required=False)


class EbookSerializer(serializers.ModelSerializer):
    ouvrage_titre = serializers.CharField(source="ouvrage.titre", read_only=True)

    class Meta:
        model = Ebook
        fields = [
            "id",
            "ouvrage",
            "ouvrage_titre",
            "format",
            "taille",
            "nom_fichier",
            "est_payant",
            "prix",
            "url_fichier",
        ]


class EbookCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ebook
        fields = [
            "ouvrage",
            "format",
            "taille",
            "nom_fichier",
            "est_payant",
            "prix",
            "url_fichier",
            "fichier",
        ]

    def validate(self, attrs):
        fichier = attrs.get("fichier")
        url = attrs.get("url_fichier")
        if not fichier and not url:
            raise serializers.ValidationError("Fichier ou URL requis.")
        if attrs.get("est_payant") and not attrs.get("prix"):
            raise serializers.ValidationError("Prix requis pour un e-book payant.")
        return attrs


class EbookUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ebook
        fields = [
            "ouvrage",
            "format",
            "taille",
            "nom_fichier",
            "est_payant",
            "prix",
            "url_fichier",
            "fichier",
        ]

    def validate(self, attrs):
        instance = getattr(self, "instance", None)
        fichier = attrs.get("fichier") or (instance.fichier if instance else None)
        url = attrs.get("url_fichier") or (instance.url_fichier if instance else None)
        if not fichier and not url:
            raise serializers.ValidationError("Fichier ou URL requis.")
        if attrs.get("est_payant") and not attrs.get("prix"):
            raise serializers.ValidationError("Prix requis pour un e-book payant.")
        return attrs
