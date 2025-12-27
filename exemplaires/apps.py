from django.apps import AppConfig


class ExemplairesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'exemplaires'

    def ready(self):
        from . import signals  # noqa: F401
