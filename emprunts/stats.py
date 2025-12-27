from django.db.models import Count

from .models import Emprunt, Penalite


def lecteurs_les_plus_actifs(limit: int = 10):
    return (
        Emprunt.objects
        .values("adherent__user__username")
        .annotate(total=Count("id"))
        .order_by("-total")[:limit]
    )


def ouvrages_les_plus_empruntes(limit: int = 10):
    return (
        Emprunt.objects
        .values("exemplaire__ouvrage__titre")
        .annotate(total=Count("id"))
        .order_by("-total")[:limit]
    )


def resume_dashboard(user=None):
    emprunts = Emprunt.objects.all()
    penalites = Penalite.objects.all()

    if user is not None and hasattr(user, "adherent"):
        emprunts = emprunts.filter(adherent__user=user)
        penalites = penalites.filter(emprunt__adherent__user=user)

    return {
        "nb_emprunts_total": emprunts.count(),
        "nb_emprunts_en_retard": emprunts.filter(statut="EN_RETARD").count(),
        "nb_penalites_impayees": penalites.filter(payee=False).count(),
    }
