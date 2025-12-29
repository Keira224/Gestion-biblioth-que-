# Role de ce fichier: modele user profile + roles.
from django.conf import settings
from django.db import models


class UserRole(models.TextChoices):
    # Roles d'acces du systeme.
    ADMIN = "ADMIN", "Administrateur"
    BIBLIOTHECAIRE = "BIBLIOTHECAIRE", "Bibliothécaire"
    LECTEUR = "LECTEUR", "Lecteur"


class UserProfile(models.Model):
    # Profil associe a un user (role).
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile"
    )
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.LECTEUR
    )

    def __str__(self):
        return f"{self.user.username} - {self.role}"
