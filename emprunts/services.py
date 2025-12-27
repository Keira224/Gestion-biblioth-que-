from __future__ import annotations

from datetime import timedelta
from decimal import Decimal
from typing import Optional

from django.db import transaction
from django.utils import timezone

from adherents.models import Adherent
from core.models import ActivityType
from core.services import log_activity
from core.models import Parametre
from exemplaires.models import Exemplaire, EtatExemplaire

from .models import Emprunt, Penalite, StatutEmprunt

TARIF_PAR_JOUR_DEFAUT = Decimal("1000.00")  # fallback si Parametre absent/erreur


# -----------------------------
# Paramètres système
# -----------------------------
def get_parametres() -> Parametre:
    """
    On utilise une ligne unique (id=1) pour les paramètres.
    """
    p, _ = Parametre.objects.get_or_create(id=1)
    return p


def get_tarif_penalite_par_jour() -> Decimal:
    try:
        return Decimal(get_parametres().tarif_penalite_par_jour)
    except Exception:
        return TARIF_PAR_JOUR_DEFAUT


def get_duree_emprunt_jours() -> int:
    try:
        return int(get_parametres().duree_emprunt_jours)
    except Exception:
        return 14


def get_quota_emprunts_actifs() -> int:
    try:
        return int(get_parametres().quota_emprunts_actifs)
    except Exception:
        return 3


# -----------------------------
# Retards : recalcul statut
# -----------------------------
@transaction.atomic
def recalculer_statut_emprunt(emprunt: Emprunt) -> Emprunt:
    """
    Met le statut à jour selon les dates :
    - EN_RETARD si jours_de_retard > 0
    - RETOURNE si rendu et pas en retard
    - EN_COURS si pas rendu et pas en retard
    """
    is_returned = emprunt.date_retour_effective is not None
    late_days = emprunt.jours_de_retard()

    if late_days > 0:
        emprunt.statut = StatutEmprunt.EN_RETARD
    else:
        emprunt.statut = StatutEmprunt.RETOURNE if is_returned else StatutEmprunt.EN_COURS

    emprunt.save(update_fields=["statut"])
    return emprunt


@transaction.atomic
def recalculer_tous_les_retards() -> int:
    """
    Recalcule le statut pour tous les emprunts (utile quotidiennement).
    """
    count = 0
    qs = Emprunt.objects.all().only("id", "date_retour_prevue", "date_retour_effective", "statut")
    for e in qs:
        recalculer_statut_emprunt(e)
        count += 1
    return count


# -----------------------------
# Pénalités : génération / MAJ
# -----------------------------
@transaction.atomic
def generer_ou_maj_penalite(emprunt: Emprunt, tarif_par_jour: Optional[Decimal] = None) -> Optional[Penalite]:
    """
    - Si pas de retard => None
    - Si retard => crée ou met à jour la pénalité liée à l'emprunt
    - Si tarif_par_jour None => lit le tarif en base (Parametre)
    """
    jours = emprunt.jours_de_retard()
    if jours <= 0:
        return None

    tarif = tarif_par_jour if tarif_par_jour is not None else get_tarif_penalite_par_jour()
    montant = Decimal(jours) * Decimal(tarif)

    penalite, created = Penalite.objects.get_or_create(
        emprunt=emprunt,
        defaults={"jours_retard": jours, "montant": montant, "payee": False},
    )

    # mise à jour si existe et non payée
    if not created and penalite.payee is False:
        penalite.jours_retard = jours
        penalite.montant = montant
        penalite.save(update_fields=["jours_retard", "montant"])

    if created:
        log_activity(
            type=ActivityType.PENALITE_CREE,
            message=f"Penalite creee pour emprunt #{emprunt.id}",
            user=emprunt.adherent.user,
        )

    return penalite


# -----------------------------
# Circulation : créer emprunt
# -----------------------------
@transaction.atomic
def creer_emprunt(*, exemplaire: Exemplaire, adherent: Adherent) -> Emprunt:
    """
    Règles pro :
    - Exemplaire doit être DISPONIBLE
    - Adhérent ne dépasse pas le quota d'emprunts actifs (EN_COURS/EN_RETARD)
    - date_retour_prevue = today + duree_emprunt_jours
    - met l'exemplaire à EMPRUNTE
    """
    if exemplaire.etat != EtatExemplaire.DISPONIBLE:
        raise ValueError("Exemplaire indisponible.")

    quota = get_quota_emprunts_actifs()
    actifs = Emprunt.objects.filter(
        adherent=adherent,
        statut__in=[StatutEmprunt.EN_COURS, StatutEmprunt.EN_RETARD],
    ).count()

    if actifs >= quota:
        raise ValueError("Quota d'emprunts actifs dépassé.")

    today = timezone.localdate()
    due = today + timedelta(days=get_duree_emprunt_jours())

    emprunt = Emprunt.objects.create(
        exemplaire=exemplaire,
        adherent=adherent,
        date_retour_prevue=due,
        statut=StatutEmprunt.EN_COURS,
    )

    exemplaire.etat = EtatExemplaire.EMPRUNTE
    exemplaire.save(update_fields=["etat"])

    log_activity(
        type=ActivityType.EMPRUNT_CREE,
        message=f"Emprunt cree pour {exemplaire.code_barre}",
        user=adherent.user,
    )

    return emprunt


# -----------------------------
# Circulation : enregistrer retour
# -----------------------------
@transaction.atomic
def enregistrer_retour(*, emprunt: Emprunt) -> dict:
    """
    Retour pro :
    - date_retour_effective = today
    - recalcul statut
    - génération pénalité si retard
    - remet l'exemplaire à DISPONIBLE
    """
    if emprunt.date_retour_effective is not None:
        raise ValueError("Cet emprunt est déjà retourné.")

    emprunt.date_retour_effective = timezone.localdate()
    emprunt.save(update_fields=["date_retour_effective"])

    recalculer_statut_emprunt(emprunt)
    penalite = generer_ou_maj_penalite(emprunt)

    emprunt.exemplaire.etat = EtatExemplaire.DISPONIBLE
    emprunt.exemplaire.save(update_fields=["etat"])

    log_activity(
        type=ActivityType.RETOUR_ENREGISTRE,
        message=f"Retour enregistre pour emprunt #{emprunt.id}",
        user=emprunt.adherent.user,
    )

    return {"emprunt": emprunt, "penalite": penalite}
