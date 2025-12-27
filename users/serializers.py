from rest_framework import serializers
from django.contrib.auth import get_user_model

from adherents.models import Adherent

from .models import UserProfile, UserRole

User = get_user_model()


class AdminUserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    adherent = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "email", "is_active", "date_joined", "role", "adherent"]

    def get_role(self, obj):
        if getattr(obj, "is_superuser", False):
            return UserRole.ADMIN
        try:
            profile = obj.profile
        except UserProfile.DoesNotExist:
            profile = None
        return getattr(profile, "role", UserRole.LECTEUR)

    def get_adherent(self, obj):
        try:
            adherent = obj.adherent
        except Adherent.DoesNotExist:
            return None
        return {
            "id": adherent.id,
            "adresse": adherent.adresse,
            "telephone": adherent.telephone,
            "cotisation": str(adherent.cotisation),
        }


class AdminUserCreateSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, min_length=6)
    role = serializers.ChoiceField(choices=UserRole.choices)
    adresse = serializers.CharField(required=False, allow_blank=True)
    telephone = serializers.CharField(required=False, allow_blank=True)
    cotisation = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)

    def validate(self, attrs):
        role = attrs.get("role")
        if role == UserRole.LECTEUR:
            adresse = attrs.get("adresse")
            telephone = attrs.get("telephone")
            if not adresse or not telephone:
                raise serializers.ValidationError(
                    "Adresse et telephone requis pour un lecteur."
                )
        return attrs


class AdminUserUpdateSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150, required=False)
    email = serializers.EmailField(required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=UserRole.choices, required=False)
    is_active = serializers.BooleanField(required=False)
    adresse = serializers.CharField(required=False, allow_blank=True)
    telephone = serializers.CharField(required=False, allow_blank=True)
    cotisation = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)


class AdminPasswordResetSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True, min_length=6)
