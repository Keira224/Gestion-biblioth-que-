# Role de ce fichier: endpoints DRF pour emprunts, penalites, stats, activities.
from datetime import timedelta
from decimal import Decimal
from typing import Optional

from django.db import transaction
from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from adherents.models import Adherent
from core.models import Activity, ActivityType, Parametre, log_activity
from core.serializers import ActivitySerializer
from core.views import apply_ordering, paginate_queryset
from exemplaires.models import EtatExemplaire, Exemplaire
from ouvrages.models import Ouvrage
from users.models import UserRole
from users.views import IsAdminOrBibliothecaire, IsLecteur, get_user_role

from .models import Emprunt, Penalite, Reservation, StatutEmprunt, StatutReservation
from .serializers import (
    CreerEmpruntInputSerializer,
    CreerEmpruntLecteurSerializer,
    EmpruntSerializer,
    PenaliteSerializer,
    ReservationCreateSerializer,
    ReservationSerializer,
)

TARIF_PAR_JOUR_DEFAUT = Decimal("1000.00")


# -----------------------------
# Helpers: parametres systeme
# -----------------------------
def get_parametres() -> Parametre:
    # Utilise une seule ligne (id=1) pour les parametres systeme.
    p, _ = Parametre.objects.get_or_create(id=1)
    return p


def get_tarif_penalite_par_jour() -> Decimal:
    # Retourne le tarif en base, fallback si erreur.
    try:
        return Decimal(get_parametres().tarif_penalite_par_jour)
    except Exception:
        return TARIF_PAR_JOUR_DEFAUT


def get_tarif_reservation_par_jour() -> Decimal:
    # Retourne le tarif reservation en base, fallback si erreur.
    try:
        return Decimal(get_parametres().tarif_reservation_par_jour)
    except Exception:
        return TARIF_PAR_JOUR_DEFAUT


def get_duree_emprunt_jours() -> int:
    # Retourne la duree d'emprunt en jours.
    try:
        return int(get_parametres().duree_emprunt_jours)
    except Exception:
        return 14


def get_quota_emprunts_actifs() -> int:
    # Retourne le quota d'emprunts actifs par lecteur.
    try:
        return int(get_parametres().quota_emprunts_actifs)
    except Exception:
        return 3


# -----------------------------
# Helpers: retards + penalites
# -----------------------------
@transaction.atomic
def recalculer_statut_emprunt(emprunt: Emprunt) -> Emprunt:
    # Recalcule le statut selon les dates (retard/retour/en cours).
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
    # Recalcule le statut pour tous les emprunts (batch).
    count = 0
    qs = Emprunt.objects.all().only("id", "date_retour_prevue", "date_retour_effective", "statut")
    for e in qs:
        recalculer_statut_emprunt(e)
        count += 1
    return count


@transaction.atomic
def generer_ou_maj_penalite(emprunt: Emprunt, tarif_par_jour: Optional[Decimal] = None) -> Optional[Penalite]:
    # Cree ou met a jour la penalite si retard > 0.
    jours = emprunt.jours_de_retard()
    if jours <= 0:
        return None

    tarif = tarif_par_jour if tarif_par_jour is not None else get_tarif_penalite_par_jour()
    montant = Decimal(jours) * Decimal(tarif)

    penalite, created = Penalite.objects.get_or_create(
        emprunt=emprunt,
        defaults={"jours_retard": jours, "montant": montant, "payee": False},
    )

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
# Helpers: circulation emprunt
# -----------------------------
@transaction.atomic
def creer_emprunt(*, exemplaire: Exemplaire, adherent: Adherent) -> Emprunt:
    # Cree un emprunt en respectant quota, dates et disponibilite.
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


@transaction.atomic
def enregistrer_retour(*, emprunt: Emprunt) -> dict:
    # Enregistre un retour, met a jour statut et penalites.
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


# -----------------------------
# Helpers: statistiques
# -----------------------------
def lecteurs_les_plus_actifs(limit: int = 10):
    # Top lecteurs par nombre d'emprunts.
    return (
        Emprunt.objects
        .values("adherent__user__username")
        .annotate(total=Count("id"))
        .order_by("-total")[:limit]
    )


def ouvrages_les_plus_empruntes(limit: int = 10):
    # Top ouvrages par nombre d'emprunts.
    return (
        Emprunt.objects
        .values("exemplaire__ouvrage__titre")
        .annotate(total=Count("id"))
        .order_by("-total")[:limit]
    )


def resume_dashboard(user=None):
    # Stats simples pour cartes dashboard.
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


def reservation_date_overlap(start_a, end_a, start_b, end_b) -> bool:
    return start_a <= end_b and start_b <= end_a


# -----------------------------
# Endpoints: emprunts
# -----------------------------
@api_view(["POST"])
@permission_classes([IsAdminOrBibliothecaire])
def creer_emprunt_api(request):
    # Ce que ca fait: creation emprunt (admin/biblio).
    # Payload: { exemplaire_id, adherent_id }.
    # Reponse: emprunt cree.
    s = CreerEmpruntInputSerializer(data=request.data)
    s.is_valid(raise_exception=True)

    try:
        exemplaire = Exemplaire.objects.get(id=s.validated_data["exemplaire_id"])
    except Exemplaire.DoesNotExist:
        return Response({"detail": "Exemplaire introuvable."}, status=status.HTTP_404_NOT_FOUND)

    try:
        adherent = Adherent.objects.get(id=s.validated_data["adherent_id"])
    except Adherent.DoesNotExist:
        return Response({"detail": "Adherent introuvable."}, status=status.HTTP_404_NOT_FOUND)

    try:
        e = creer_emprunt(exemplaire=exemplaire, adherent=adherent)
    except ValueError as ex:
        return Response({"detail": str(ex)}, status=status.HTTP_400_BAD_REQUEST)

    return Response(EmpruntSerializer(e).data, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([IsLecteur])
def creer_emprunt_lecteur(request):
    # Ce que ca fait: creation emprunt par lecteur.
    # Payload: { exemplaire_id }.
    # Reponse: emprunt cree.
    s = CreerEmpruntLecteurSerializer(data=request.data)
    s.is_valid(raise_exception=True)

    try:
        exemplaire = Exemplaire.objects.get(id=s.validated_data["exemplaire_id"])
    except Exemplaire.DoesNotExist:
        return Response({"detail": "Exemplaire introuvable."}, status=status.HTTP_404_NOT_FOUND)

    try:
        adherent = request.user.adherent
    except Adherent.DoesNotExist:
        return Response({"detail": "Adherent introuvable."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        e = creer_emprunt(exemplaire=exemplaire, adherent=adherent)
    except ValueError as ex:
        return Response({"detail": str(ex)}, status=status.HTTP_400_BAD_REQUEST)

    return Response(EmpruntSerializer(e).data, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([IsAdminOrBibliothecaire])
def retour_emprunt_api(request, emprunt_id: int):
    # Ce que ca fait: enregistre un retour (admin/biblio).
    # Payload: none.
    # Reponse: emprunt + penalite si besoin.
    try:
        emprunt = Emprunt.objects.get(id=emprunt_id)
    except Emprunt.DoesNotExist:
        return Response({"detail": "Emprunt introuvable."}, status=status.HTTP_404_NOT_FOUND)

    try:
        result = enregistrer_retour(emprunt=emprunt)
    except ValueError as ex:
        return Response({"detail": str(ex)}, status=status.HTTP_400_BAD_REQUEST)

    data = {
        "emprunt": EmpruntSerializer(result["emprunt"]).data,
        "penalite": PenaliteSerializer(result["penalite"]).data if result["penalite"] else None,
    }
    return Response(data, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsLecteur])
def retour_emprunt_lecteur(request, emprunt_id: int):
    # Ce que ca fait: retour d'un emprunt par lecteur.
    # Payload: none.
    # Reponse: emprunt + penalite si besoin.
    try:
        emprunt = Emprunt.objects.get(id=emprunt_id, adherent__user=request.user)
    except Emprunt.DoesNotExist:
        return Response({"detail": "Emprunt introuvable."}, status=status.HTTP_404_NOT_FOUND)

    try:
        result = enregistrer_retour(emprunt=emprunt)
    except ValueError as ex:
        return Response({"detail": str(ex)}, status=status.HTTP_400_BAD_REQUEST)

    data = {
        "emprunt": EmpruntSerializer(result["emprunt"]).data,
        "penalite": PenaliteSerializer(result["penalite"]).data if result["penalite"] else None,
    }
    return Response(data, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAdminOrBibliothecaire])
def recalcul_retards_api(request):
    # Ce que ca fait: batch recalcul des retards (admin/biblio).
    # Payload: none.
    # Reponse: { recalculees }.
    n = recalculer_tous_les_retards()
    return Response({"recalcules": n}, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def emprunts_recents(request):
    # Ce que ca fait: liste recents; lecteur voit les siens.
    # Payload: query params (statut, ordering, page).
    # Reponse: liste paginee.
    role = get_user_role(request.user)
    qs = Emprunt.objects.select_related(
        "exemplaire__ouvrage",
        "adherent__user",
    )

    if role == UserRole.LECTEUR:
        qs = qs.filter(adherent__user=request.user)

    statut = request.query_params.get("statut")
    if statut:
        qs = qs.filter(statut=statut)

    qs = apply_ordering(
        qs,
        request,
        allowed_fields=["date_emprunt", "date_retour_prevue", "date_retour_effective", "statut"],
        default="-date_emprunt",
    )

    items, meta = paginate_queryset(qs, request, default_page_size=5)
    return Response({"results": EmpruntSerializer(items, many=True).data, "pagination": meta})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def emprunts_historique(request):
    # Ce que ca fait: historique complet; lecteur voit les siens.
    # Payload: query params (adherent_id, ordering, page).
    # Reponse: liste paginee.
    role = get_user_role(request.user)
    qs = Emprunt.objects.select_related(
        "exemplaire__ouvrage",
        "adherent__user",
    )

    if role == UserRole.LECTEUR:
        qs = qs.filter(adherent__user=request.user)
    else:
        adherent_id = request.query_params.get("adherent_id")
        if adherent_id:
            qs = qs.filter(adherent_id=adherent_id)

    search = request.query_params.get("search")
    if search:
        qs = qs.filter(
            Q(exemplaire__ouvrage__titre__icontains=search)
            | Q(adherent__user__username__icontains=search)
        )

    qs = apply_ordering(
        qs,
        request,
        allowed_fields=["date_emprunt", "date_retour_prevue", "date_retour_effective", "statut"],
        default="-date_emprunt",
    )
    items, meta = paginate_queryset(qs, request, default_page_size=20)
    return Response({"results": EmpruntSerializer(items, many=True).data, "pagination": meta})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def emprunts_retards(request):
    # Ce que ca fait: liste des emprunts en retard.
    # Permissions: auth; lecteur voit les siens.
    role = get_user_role(request.user)
    qs = Emprunt.objects.filter(statut=StatutEmprunt.EN_RETARD).select_related(
        "exemplaire__ouvrage",
        "adherent__user",
    )

    if role == UserRole.LECTEUR:
        qs = qs.filter(adherent__user=request.user)

    search = request.query_params.get("search")
    if search:
        qs = qs.filter(
            Q(exemplaire__ouvrage__titre__icontains=search)
            | Q(adherent__user__username__icontains=search)
        )

    qs = apply_ordering(
        qs,
        request,
        allowed_fields=["date_retour_prevue", "date_emprunt", "statut"],
        default="-date_retour_prevue",
    )

    items, meta = paginate_queryset(qs, request, default_page_size=10)
    return Response({"results": EmpruntSerializer(items, many=True).data, "pagination": meta})


@api_view(["GET"])
@permission_classes([IsAdminOrBibliothecaire])
def emprunts_en_cours(request):
    # Ce que ca fait: liste des emprunts en cours (admin/biblio).
    qs = Emprunt.objects.filter(statut=StatutEmprunt.EN_COURS).select_related(
        "exemplaire__ouvrage",
        "adherent__user",
    )

    search = request.query_params.get("search")
    if search:
        qs = qs.filter(
            Q(exemplaire__ouvrage__titre__icontains=search)
            | Q(adherent__user__username__icontains=search)
        )

    qs = apply_ordering(
        qs,
        request,
        allowed_fields=["date_emprunt", "date_retour_prevue", "statut"],
        default="-date_emprunt",
    )

    items, meta = paginate_queryset(qs, request, default_page_size=10)
    return Response({"results": EmpruntSerializer(items, many=True).data, "pagination": meta})


# -----------------------------
# Endpoints: penalites
# -----------------------------
@api_view(["GET"])
@permission_classes([IsAdminOrBibliothecaire])
def liste_penalites(request):
    # Ce que ca fait: liste des penalites (admin/biblio).
    qs = Penalite.objects.select_related(
        "emprunt__exemplaire__ouvrage",
        "emprunt__adherent__user",
    )
    search = request.query_params.get("search")
    if search:
        qs = qs.filter(
            Q(emprunt__adherent__user__username__icontains=search)
            | Q(emprunt__exemplaire__ouvrage__titre__icontains=search)
            | Q(emprunt__exemplaire__code_barre__icontains=search)
        )
    payee = request.query_params.get("payee")
    if payee in {"true", "false"}:
        qs = qs.filter(payee=(payee == "true"))

    qs = apply_ordering(
        qs,
        request,
        allowed_fields=["date_creation", "montant", "jours_retard", "payee"],
        default="-date_creation",
    )
    items, meta = paginate_queryset(qs, request, default_page_size=10)
    return Response({"results": PenaliteSerializer(items, many=True).data, "pagination": meta})


@api_view(["GET"])
@permission_classes([IsLecteur])
def mes_penalites(request):
    # Ce que ca fait: penalites du lecteur connecte.
    qs = Penalite.objects.filter(
        emprunt__adherent__user=request.user
    ).select_related(
        "emprunt__exemplaire__ouvrage",
        "emprunt__adherent__user",
    )
    qs = apply_ordering(
        qs,
        request,
        allowed_fields=["date_creation", "montant", "jours_retard", "payee"],
        default="-date_creation",
    )
    items, meta = paginate_queryset(qs, request, default_page_size=10)
    return Response({"results": PenaliteSerializer(items, many=True).data, "pagination": meta})


@api_view(["POST"])
@permission_classes([IsAdminOrBibliothecaire])
def payer_penalite(request, penalite_id: int):
    # Ce que ca fait: marque une penalite comme payee.
    try:
        p = Penalite.objects.get(id=penalite_id)
    except Penalite.DoesNotExist:
        return Response({"detail": "Pénalité introuvable."}, status=status.HTTP_404_NOT_FOUND)

    if not p.payee:
        p.payee = True
        p.save(update_fields=["payee"])
        log_activity(
            type=ActivityType.PENALITE_PAYEE,
            message=f"Penalite payee pour emprunt #{p.emprunt_id}",
            user=p.emprunt.adherent.user,
        )
    return Response(PenaliteSerializer(p).data, status=status.HTTP_200_OK)


# -----------------------------
# Endpoints: stats dashboard
# -----------------------------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def stats_dashboard(request):
    # Ce que ca fait: stats pour dashboard (admin/biblio/lecteur).
    role = get_user_role(request.user)
    if role == UserRole.LECTEUR:
        return Response({
            "resume": resume_dashboard(user=request.user),
            "lecteurs_plus_actifs": [],
            "ouvrages_plus_empruntes": [],
        })

    return Response({
        "resume": resume_dashboard(),
        "lecteurs_plus_actifs": list(lecteurs_les_plus_actifs(limit=10)),
        "ouvrages_plus_empruntes": list(ouvrages_les_plus_empruntes(limit=10)),
    })


# -----------------------------
# Endpoints: activities
# -----------------------------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_activities(request):
    # Ce que ca fait: dernieres activites (lecteur => ses activites).
    role = get_user_role(request.user)
    qs = Activity.objects.all()
    if role == UserRole.LECTEUR:
        qs = qs.filter(user=request.user)

    qs = apply_ordering(
        qs,
        request,
        allowed_fields=["created_at"],
        default="-created_at",
    )
    items, meta = paginate_queryset(qs, request, default_page_size=10)
    return Response({"results": ActivitySerializer(items, many=True).data, "pagination": meta})


# -----------------------------
# Endpoints: reservations
# -----------------------------
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def reservations(request):
    # Liste ou creation de reservations.
    if request.method == "GET":
        role = get_user_role(request.user)
        qs = Reservation.objects.select_related("ouvrage", "adherent__user")
        if role == UserRole.LECTEUR:
            qs = qs.filter(adherent__user=request.user)

        statut = request.query_params.get("statut")
        if statut:
            qs = qs.filter(statut=statut)
        search = request.query_params.get("search")
        if search:
            qs = qs.filter(
                Q(ouvrage__titre__icontains=search)
                | Q(adherent__user__username__icontains=search)
            )

        qs = apply_ordering(
            qs,
            request,
            allowed_fields=["date_creation", "statut"],
            default="-date_creation",
        )
        items, meta = paginate_queryset(qs, request, default_page_size=10)
        return Response({"results": ReservationSerializer(items, many=True).data, "pagination": meta})

    if not IsLecteur().has_permission(request, None):
        return Response({"detail": "Acces interdit."}, status=status.HTTP_403_FORBIDDEN)

    serializer = ReservationCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    try:
        adherent = request.user.adherent
    except Adherent.DoesNotExist:
        return Response({"detail": "Adherent introuvable."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        ouvrage = Ouvrage.objects.get(id=serializer.validated_data["ouvrage_id"])
    except Ouvrage.DoesNotExist:
        return Response({"detail": "Ouvrage introuvable."}, status=status.HTTP_404_NOT_FOUND)

    date_debut = serializer.validated_data["date_debut"]
    date_fin = serializer.validated_data["date_fin"]

    if date_fin <= date_debut:
        return Response({"detail": "Date de fin invalide."}, status=status.HTTP_400_BAD_REQUEST)

    exemplaires_total = Exemplaire.objects.filter(ouvrage=ouvrage).count()
    if exemplaires_total == 0:
        return Response({"detail": "Aucun exemplaire pour cet ouvrage."}, status=status.HTTP_400_BAD_REQUEST)

    reservations_overlap = Reservation.objects.filter(
        ouvrage=ouvrage,
        statut__in=[StatutReservation.EN_ATTENTE, StatutReservation.VALIDEE],
        date_debut__lte=date_fin,
        date_fin__gte=date_debut,
    ).count()

    emprunts_overlap = Emprunt.objects.filter(
        exemplaire__ouvrage=ouvrage,
        statut__in=[StatutEmprunt.EN_COURS, StatutEmprunt.EN_RETARD],
        date_retour_prevue__gte=date_debut,
    ).count()

    if reservations_overlap + emprunts_overlap >= exemplaires_total:
        tarif = get_tarif_reservation_par_jour()
        jours = (date_fin - date_debut).days
        montant = Decimal(jours) * Decimal(tarif)
        reservation = Reservation.objects.create(
            adherent=adherent,
            ouvrage=ouvrage,
            date_debut=date_debut,
            date_fin=date_fin,
            montant_estime=montant,
            statut=StatutReservation.EN_ATTENTE,
        )
        return Response(ReservationSerializer(reservation).data, status=status.HTTP_201_CREATED)

    return Response({"detail": "Ouvrage disponible, reservation non necessaire."}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsLecteur])
def mes_reservations(request):
    # Liste reservations du lecteur connecte.
    qs = Reservation.objects.filter(adherent__user=request.user).select_related("ouvrage", "adherent__user")
    qs = apply_ordering(qs, request, allowed_fields=["date_creation", "statut"], default="-date_creation")
    items, meta = paginate_queryset(qs, request, default_page_size=10)
    return Response({"results": ReservationSerializer(items, many=True).data, "pagination": meta})


@api_view(["POST"])
@permission_classes([IsLecteur])
def annuler_reservation(request, reservation_id: int):
    # Annule une reservation (lecteur).
    try:
        reservation = Reservation.objects.get(id=reservation_id, adherent__user=request.user)
    except Reservation.DoesNotExist:
        return Response({"detail": "Reservation introuvable."}, status=status.HTTP_404_NOT_FOUND)

    if reservation.statut != StatutReservation.EN_ATTENTE:
        return Response({"detail": "Reservation non annulable."}, status=status.HTTP_400_BAD_REQUEST)

    reservation.statut = StatutReservation.ANNULEE
    reservation.date_traitement = timezone.now()
    reservation.save(update_fields=["statut", "date_traitement"])
    return Response(ReservationSerializer(reservation).data, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAdminOrBibliothecaire])
def valider_reservation(request, reservation_id: int):
    # Valide une reservation (admin/biblio).
    try:
        reservation = Reservation.objects.get(id=reservation_id)
    except Reservation.DoesNotExist:
        return Response({"detail": "Reservation introuvable."}, status=status.HTTP_404_NOT_FOUND)

    if reservation.statut != StatutReservation.EN_ATTENTE:
        return Response({"detail": "Reservation non modifiable."}, status=status.HTTP_400_BAD_REQUEST)

    reservation.statut = StatutReservation.VALIDEE
    reservation.date_traitement = timezone.now()
    reservation.save(update_fields=["statut", "date_traitement"])
    return Response(ReservationSerializer(reservation).data, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAdminOrBibliothecaire])
def refuser_reservation(request, reservation_id: int):
    # Refuse une reservation (admin/biblio).
    try:
        reservation = Reservation.objects.get(id=reservation_id)
    except Reservation.DoesNotExist:
        return Response({"detail": "Reservation introuvable."}, status=status.HTTP_404_NOT_FOUND)

    if reservation.statut != StatutReservation.EN_ATTENTE:
        return Response({"detail": "Reservation non modifiable."}, status=status.HTTP_400_BAD_REQUEST)

    reservation.statut = StatutReservation.REFUSEE
    reservation.date_traitement = timezone.now()
    reservation.save(update_fields=["statut", "date_traitement"])
    return Response(ReservationSerializer(reservation).data, status=status.HTTP_200_OK)
