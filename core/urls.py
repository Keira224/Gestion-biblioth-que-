from django.urls import path

from .api import initier_paiement, payer

urlpatterns = [
    path("api/paiements/initier/", initier_paiement),
    path("api/paiements/<int:paiement_id>/payer/", payer),
]
