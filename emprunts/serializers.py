from rest_framework import serializers

from .models import Emprunt, Penalite, Reservation


class EmpruntSerializer(serializers.ModelSerializer):
    jours_retard = serializers.SerializerMethodField()
    exemplaire_code = serializers.CharField(source="exemplaire.code_barre", read_only=True)
    ouvrage_titre = serializers.CharField(source="exemplaire.ouvrage.titre", read_only=True)
    adherent_username = serializers.CharField(source="adherent.user.username", read_only=True)
    adherent_nom = serializers.CharField(source="adherent.user.last_name", read_only=True)
    adherent_prenom = serializers.CharField(source="adherent.user.first_name", read_only=True)

    class Meta:
        model = Emprunt
        fields = [
            "id",
            "exemplaire",
            "adherent",
            "exemplaire_code",
            "ouvrage_titre",
            "adherent_username",
            "adherent_nom",
            "adherent_prenom",
            "date_emprunt",
            "date_retour_prevue",
            "date_retour_effective",
            "statut",
            "jours_retard",
        ]

    def get_jours_retard(self, obj: Emprunt):
        return obj.jours_de_retard()


class PenaliteSerializer(serializers.ModelSerializer):
    emprunt_id = serializers.IntegerField(source="emprunt.id", read_only=True)
    adherent_username = serializers.CharField(source="emprunt.adherent.user.username", read_only=True)
    ouvrage_titre = serializers.CharField(source="emprunt.exemplaire.ouvrage.titre", read_only=True)
    exemplaire_code = serializers.CharField(source="emprunt.exemplaire.code_barre", read_only=True)
    date_emprunt = serializers.DateField(source="emprunt.date_emprunt", read_only=True)
    date_retour_prevue = serializers.DateField(source="emprunt.date_retour_prevue", read_only=True)

    class Meta:
        model = Penalite
        fields = [
            "id",
            "emprunt",
            "emprunt_id",
            "jours_retard",
            "montant",
            "payee",
            "date_creation",
            "adherent_username",
            "ouvrage_titre",
            "exemplaire_code",
            "date_emprunt",
            "date_retour_prevue",
        ]


class CreerEmpruntInputSerializer(serializers.Serializer):
    exemplaire_id = serializers.IntegerField()
    adherent_id = serializers.IntegerField()


class CreerEmpruntLecteurSerializer(serializers.Serializer):
    exemplaire_id = serializers.IntegerField()


class ReservationSerializer(serializers.ModelSerializer):
    ouvrage_titre = serializers.CharField(source="ouvrage.titre", read_only=True)
    ouvrage_auteur = serializers.CharField(source="ouvrage.auteur", read_only=True)
    adherent_username = serializers.CharField(source="adherent.user.username", read_only=True)

    class Meta:
        model = Reservation
        fields = [
            "id",
            "ouvrage",
            "ouvrage_titre",
            "ouvrage_auteur",
            "adherent",
            "adherent_username",
            "statut",
            "date_creation",
            "date_traitement",
        ]


class ReservationCreateSerializer(serializers.Serializer):
    ouvrage_id = serializers.IntegerField()
