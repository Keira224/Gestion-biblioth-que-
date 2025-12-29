# Role de ce fichier: routes ouvrages.
from django.urls import path

from .views import ouvrage_detail, ouvrages_list

urlpatterns = [
    path("api/catalogue/ouvrages/", ouvrages_list),
    path("api/catalogue/ouvrages/<int:ouvrage_id>/", ouvrage_detail),
]
