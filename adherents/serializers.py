from rest_framework import serializers

from .models import Adherent


class AdherentListSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    nom = serializers.CharField(source="user.last_name", read_only=True)
    prenom = serializers.CharField(source="user.first_name", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = Adherent
        fields = ["id", "username", "nom", "prenom", "email", "telephone", "adresse"]
