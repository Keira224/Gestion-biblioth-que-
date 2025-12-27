from django.db.models.signals import post_save
from django.dispatch import receiver

from core.models import ActivityType
from core.services import log_activity

from .models import Exemplaire


@receiver(post_save, sender=Exemplaire)
def log_exemplaire_created(sender, instance, created, **kwargs):
    if created:
        log_activity(
            type=ActivityType.EXEMPLAIRE_AJOUTE,
            message=f"Exemplaire ajoute: {instance.code_barre}",
        )
