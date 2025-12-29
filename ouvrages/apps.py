# Role de ce fichier: config Django de l'app ouvrages.
from django.apps import AppConfig


class OuvragesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'ouvrages'
