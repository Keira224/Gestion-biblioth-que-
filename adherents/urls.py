# Role de ce fichier: routes adherents.
from django.urls import path

from .views import liste_adherents

urlpatterns = [
    path("api/adherents/", liste_adherents),
]
