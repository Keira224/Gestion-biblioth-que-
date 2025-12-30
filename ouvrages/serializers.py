# Role de ce fichier: serializers DRF pour ouvrages.
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
