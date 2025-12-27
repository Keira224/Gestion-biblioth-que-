from typing import Optional

from rest_framework.permissions import BasePermission

from .models import UserRole


def get_user_role(user) -> Optional[str]:
    if user is None or not user.is_authenticated:
        return None
    if getattr(user, "is_superuser", False):
        return UserRole.ADMIN
    profile = getattr(user, "profile", None)
    return getattr(profile, "role", None) or UserRole.LECTEUR


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return get_user_role(request.user) == UserRole.ADMIN


class IsAdminOnly(IsAdmin):
    pass


class IsBibliothecaire(BasePermission):
    def has_permission(self, request, view):
        return get_user_role(request.user) == UserRole.BIBLIOTHECAIRE


class IsLecteur(BasePermission):
    def has_permission(self, request, view):
        return get_user_role(request.user) == UserRole.LECTEUR


class IsAdminOrBibliothecaire(BasePermission):
    def has_permission(self, request, view):
        return get_user_role(request.user) in {UserRole.ADMIN, UserRole.BIBLIOTHECAIRE}
