from django.urls import path

from .api_views import liste_adherents

urlpatterns = [
    path("api/adherents/", liste_adherents),
]
