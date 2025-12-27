from django.db.models.signals import post_save
from django.dispatch import receiver

from core.models import ActivityType
from core.services import log_activity

from .models import Ouvrage


@receiver(post_save, sender=Ouvrage)
def log_ouvrage_created(sender, instance, created, **kwargs):
    if created:
        log_activity(
            type=ActivityType.OUVRAGE_AJOUTE,
            message=f"Ouvrage ajoute: {instance.titre}",
        )
