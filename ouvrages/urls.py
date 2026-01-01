# Role de ce fichier: routes ouvrages.
from django.urls import path

from .views import (
    ouvrage_detail,
    ouvrages_list,
    demandes_livres,
    mes_demandes_livres,
    demande_livre_status,
    ebooks,
    ebook_download,
    ebook_detail,
)

urlpatterns = [
    path("api/catalogue/ouvrages/", ouvrages_list),
    path("api/catalogue/ouvrages/<int:ouvrage_id>/", ouvrage_detail),
    path("api/demandes-livres/", demandes_livres),
    path("api/demandes-livres/me/", mes_demandes_livres),
    path("api/demandes-livres/<int:demande_id>/status/", demande_livre_status),
    path("api/ebooks/", ebooks),
    path("api/ebooks/<int:ebook_id>/", ebook_detail),
    path("api/ebooks/<int:ebook_id>/download/", ebook_download),
]
