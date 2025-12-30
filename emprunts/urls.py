# Role de ce fichier: routes emprunts, penalites, stats, activities.
from django.urls import path

from .views import (
    creer_emprunt_api,
    creer_emprunt_lecteur,
    retour_emprunt_api,
    retour_emprunt_lecteur,
    recalcul_retards_api,
    emprunts_recents,
    emprunts_historique,
    emprunts_retards,
    emprunts_en_cours,
    liste_penalites,
    mes_penalites,
    payer_penalite,
    stats_dashboard,
    dashboard_activities,
    reservations,
    mes_reservations,
    annuler_reservation,
    valider_reservation,
    refuser_reservation,
)

urlpatterns = [
    # Emprunts
    path("api/emprunts/creer/", creer_emprunt_api),
    path("api/lecteur/emprunts/creer/", creer_emprunt_lecteur),
    path("api/emprunts/<int:emprunt_id>/retour/", retour_emprunt_api),
    path("api/lecteur/emprunts/<int:emprunt_id>/retour/", retour_emprunt_lecteur),
    path("api/emprunts/recalcul-retards/", recalcul_retards_api),
    path("api/emprunts/recents/", emprunts_recents),
    path("api/emprunts/historique/", emprunts_historique),
    path("api/emprunts/retards/", emprunts_retards),
    path("api/emprunts/en-cours/", emprunts_en_cours),

    # Pénalités
    path("api/penalites/", liste_penalites),
    path("api/penalites/me/", mes_penalites),
    path("api/penalites/<int:penalite_id>/payer/", payer_penalite),

    # Dashboard
    path("api/dashboard/stats/", stats_dashboard),
    path("api/dashboard/activities/", dashboard_activities),

    # Reservations
    path("api/reservations/", reservations),
    path("api/reservations/me/", mes_reservations),
    path("api/reservations/<int:reservation_id>/annuler/", annuler_reservation),
    path("api/reservations/<int:reservation_id>/valider/", valider_reservation),
    path("api/reservations/<int:reservation_id>/refuser/", refuser_reservation),
]
