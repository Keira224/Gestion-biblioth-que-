# Role de ce fichier: configuration Django admin pour users.
from django.contrib import admin

from .models import UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    # Admin: affiche role et user.
    list_display = ("id", "user", "role")
    search_fields = ("user__username", "user__email")
    list_filter = ("role",)
