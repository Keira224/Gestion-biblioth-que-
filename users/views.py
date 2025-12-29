# Role de ce fichier: endpoints auth + admin users + permissions par role.
from typing import Optional

from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction
from django.db.models import Q
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework.response import Response

from adherents.models import Adherent
from core.models import ActivityType, log_activity
from core.views import apply_ordering, paginate_queryset

from .models import UserProfile, UserRole
from .serializers import (
    AdminPasswordResetSerializer,
    AdminUserCreateSerializer,
    AdminUserSerializer,
    AdminUserUpdateSerializer,
)

User = get_user_model()


# Permissions par role: utilisees dans toutes les apps.
def get_user_role(user) -> Optional[str]:
    # Retourne ADMIN/BIBLIOTHECAIRE/LECTEUR ou None si anon.
    if user is None or not user.is_authenticated:
        return None
    if getattr(user, "is_superuser", False):
        return UserRole.ADMIN
    profile, _ = UserProfile.objects.get_or_create(user=user)
    return getattr(profile, "role", None) or UserRole.LECTEUR


class IsAdmin(BasePermission):
    # Autorise uniquement le role ADMIN.
    def has_permission(self, request, view):
        return get_user_role(request.user) == UserRole.ADMIN


class IsAdminOnly(IsAdmin):
    # Alias pour plus de lisibilite dans les vues.
    pass


class IsBibliothecaire(BasePermission):
    # Autorise uniquement le role BIBLIOTHECAIRE.
    def has_permission(self, request, view):
        return get_user_role(request.user) == UserRole.BIBLIOTHECAIRE


class IsLecteur(BasePermission):
    # Autorise uniquement le role LECTEUR.
    def has_permission(self, request, view):
        return get_user_role(request.user) == UserRole.LECTEUR


class IsAdminOrBibliothecaire(BasePermission):
    # Autorise ADMIN ou BIBLIOTHECAIRE.
    def has_permission(self, request, view):
        return get_user_role(request.user) in {UserRole.ADMIN, UserRole.BIBLIOTHECAIRE}


def get_profile(user):
    # Helper: garantit un profil associe.
    profile, _ = UserProfile.objects.get_or_create(user=user)
    return profile


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    # Ce que ca fait: retourne le profil minimal du user connecte.
    # Permissions: authentifie.
    # Payload: aucun.
    # Reponse: { username, role }.
    role = get_user_role(request.user)
    return Response({
        "username": request.user.username,
        "role": role,
    })


@api_view(["GET", "POST"])
@permission_classes([IsAdminOnly])
def admin_users(request):
    # Ce que ca fait: liste ou creation d'utilisateurs.
    # Permissions: ADMIN uniquement.
    # Payload: query params (GET) / body creation (POST).
    # Reponse: liste paginee ou user cree.
    if request.method == "GET":
        qs = User.objects.select_related("profile", "adherent").all()

        search = request.query_params.get("search")
        if search:
            qs = qs.filter(
                Q(username__icontains=search)
                | Q(email__icontains=search)
                | Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
            )

        role = request.query_params.get("role")
        if role:
            if role == UserRole.ADMIN:
                qs = qs.filter(Q(profile__role=role) | Q(is_superuser=True))
            else:
                qs = qs.filter(profile__role=role)

        qs = apply_ordering(
            qs,
            request,
            allowed_fields=["username", "email", "date_joined", "is_active"],
            default="username",
        )

        items, meta = paginate_queryset(qs, request, default_page_size=10)
        return Response({"results": AdminUserSerializer(items, many=True).data, "pagination": meta})

    serializer = AdminUserCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    try:
        with transaction.atomic():
            user = User.objects.create_user(
                username=data["username"],
                email=data.get("email", ""),
                password=data["password"],
            )
            profile = get_profile(user)
            profile.role = data["role"]
            profile.save(update_fields=["role"])

            if profile.role == UserRole.LECTEUR:
                Adherent.objects.get_or_create(
                    user=user,
                    defaults={
                        "adresse": data.get("adresse", ""),
                        "telephone": data.get("telephone", ""),
                        "cotisation": data.get("cotisation", 0),
                    },
                )

            log_activity(
                type=ActivityType.USER_CREATED,
                message=f"Utilisateur cree: {user.username}",
                user=user,
            )
    except IntegrityError:
        return Response(
            {"detail": "Nom d'utilisateur deja utilise."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response(AdminUserSerializer(user).data, status=status.HTTP_201_CREATED)


@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAdminOnly])
def admin_user_detail(request, user_id: int):
    # Ce que ca fait: detail / update / desactivation d'un user.
    # Permissions: ADMIN uniquement.
    # Payload: PATCH body champs user.
    # Reponse: detail ou 204.
    try:
        user = User.objects.select_related("profile", "adherent").get(id=user_id)
    except User.DoesNotExist:
        return Response({"detail": "Utilisateur introuvable."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        return Response(AdminUserSerializer(user).data)

    if request.method == "DELETE":
        if user.is_active:
            user.is_active = False
            user.save(update_fields=["is_active"])
            log_activity(
                type=ActivityType.USER_DISABLED,
                message=f"Utilisateur desactive: {user.username}",
                user=user,
            )
        return Response(status=status.HTTP_204_NO_CONTENT)

    serializer = AdminUserUpdateSerializer(data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    fields_to_update = []
    if "username" in data and data["username"] != user.username:
        user.username = data["username"]
        fields_to_update.append("username")
    if "email" in data and data["email"] != user.email:
        user.email = data["email"]
        fields_to_update.append("email")
    if "is_active" in data and data["is_active"] != user.is_active:
        user.is_active = data["is_active"]
        fields_to_update.append("is_active")

    profile = get_profile(user)
    if "role" in data and data["role"] != profile.role:
        profile.role = data["role"]
        profile.save(update_fields=["role"])

    if profile.role == UserRole.LECTEUR:
        adherent = getattr(user, "adherent", None)
        if adherent is None and (not data.get("adresse") or not data.get("telephone")):
            return Response(
                {"detail": "Adresse et telephone requis pour un lecteur."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if adherent is None:
            adherent = Adherent.objects.create(
                user=user,
                adresse=data.get("adresse", ""),
                telephone=data.get("telephone", ""),
                cotisation=data.get("cotisation", 0),
            )
        else:
            adherent_fields = []
            if "adresse" in data:
                adherent.adresse = data["adresse"]
                adherent_fields.append("adresse")
            if "telephone" in data:
                adherent.telephone = data["telephone"]
                adherent_fields.append("telephone")
            if "cotisation" in data:
                adherent.cotisation = data["cotisation"]
                adherent_fields.append("cotisation")
            if adherent_fields:
                adherent.save(update_fields=adherent_fields)

    if fields_to_update:
        try:
            user.save(update_fields=fields_to_update)
        except IntegrityError:
            return Response(
                {"detail": "Nom d'utilisateur deja utilise."},
                status=status.HTTP_400_BAD_REQUEST,
            )

    log_activity(
        type=ActivityType.USER_UPDATED,
        message=f"Utilisateur modifie: {user.username}",
        user=user,
    )

    return Response(AdminUserSerializer(user).data, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAdminOnly])
def admin_user_password(request, user_id: int):
    # Ce que ca fait: reinitialise le mot de passe d'un user.
    # Permissions: ADMIN uniquement.
    # Payload: { password }.
    # Reponse: message succes.
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"detail": "Utilisateur introuvable."}, status=status.HTTP_404_NOT_FOUND)

    serializer = AdminPasswordResetSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    user.set_password(serializer.validated_data["password"])
    user.save(update_fields=["password"])

    log_activity(
        type=ActivityType.PASSWORD_RESET,
        message=f"Mot de passe reinitialise pour {user.username}",
        user=user,
    )

    return Response({"detail": "Mot de passe reinitialise."}, status=status.HTTP_200_OK)
