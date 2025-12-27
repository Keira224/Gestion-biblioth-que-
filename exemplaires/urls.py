from django.urls import path

from .api_views import exemplaire_detail, exemplaires_disponibles, exemplaires_par_ouvrage

urlpatterns = [
    path("api/catalogue/exemplaires-disponibles/", exemplaires_disponibles),
    path("api/catalogue/ouvrages/<int:ouvrage_id>/exemplaires/", exemplaires_par_ouvrage),
    path("api/catalogue/exemplaires/<int:exemplaire_id>/", exemplaire_detail),
]
