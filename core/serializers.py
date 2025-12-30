# Role de ce fichier: serializers DRF pour les modeles du core.
from rest_framework import serializers

from .models import Activity, Paiement


class ActivitySerializer(serializers.ModelSerializer):
    # Serialize une activite pour le dashboard.
    class Meta:
        model = Activity
        fields = ["id", "type", "message", "created_at"]


class PaiementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paiement
        fields = ["id", "type", "reference_objet", "montant", "statut", "date_paiement"]
