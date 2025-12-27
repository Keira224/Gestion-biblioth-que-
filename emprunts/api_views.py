from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from adherents.models import Adherent
from django.utils import timezone

from exemplaires.models import Exemplaire
from ouvrages.models import Ouvrage
from users.models import UserRole
from users.permissions import IsAdminOrBibliothecaire, IsLecteur, get_user_role

from core.api_utils import apply_ordering, paginate_queryset
from core.models import Activity, ActivityType
from core.serializers import ActivitySerializer
from core.services import log_activity

from .models import Emprunt, Penalite, Reservation, StatutEmprunt, StatutReservation
from .serializers import (
    CreerEmpruntInputSerializer,
    CreerEmpruntLecteurSerializer,
    EmpruntSerializer,
    PenaliteSerializer,
    ReservationCreateSerializer,
    ReservationSerializer,
)
from .services import (
    creer_emprunt,
    enregistrer_retour,
    recalculer_tous_les_retards,
)
from .stats import lecteurs_les_plus_actifs, ouvrages_les_plus_empruntes, resume_dashboard


# -----------------------------
# Emprunts
# -----------------------------
@api_view(["POST"])
@permission_classes([IsAdminOrBibliothecaire])
def creer_emprunt_api(request):
    """
    POST /api/emprunts/creer/
    Body: { "exemplaire_id": 1, "adherent_id": 2 }
    """
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
    """
    POST /api/lecteur/emprunts/creer/
    Body: { "exemplaire_id": 1 }
    """
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
    """
    POST /api/emprunts/<id>/retour/
    """
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
    """
    POST /api/lecteur/emprunts/<id>/retour/
    """
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
    """
    POST /api/emprunts/recalcul-retards/
    Recalcule tous les statuts (utile pour test / admin).
    """
    n = recalculer_tous_les_retards()
    return Response({"recalcules": n}, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def emprunts_recents(request):
    """
    GET /api/emprunts/recents/
    """
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
    """
    GET /api/emprunts/historique/
    """
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
    """
    GET /api/emprunts/retards/
    """
    role = get_user_role(request.user)
    qs = Emprunt.objects.filter(statut=StatutEmprunt.EN_RETARD).select_related(
        "exemplaire__ouvrage",
        "adherent__user",
    )

    if role == UserRole.LECTEUR:
        qs = qs.filter(adherent__user=request.user)

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
    """
    GET /api/emprunts/en-cours/
    """
    qs = Emprunt.objects.filter(statut=StatutEmprunt.EN_COURS).select_related(
        "exemplaire__ouvrage",
        "adherent__user",
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
# Pénalités
# -----------------------------
@api_view(["GET"])
@permission_classes([IsAdminOrBibliothecaire])
def liste_penalites(request):
    qs = Penalite.objects.select_related(
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


@api_view(["GET"])
@permission_classes([IsLecteur])
def mes_penalites(request):
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
# Stats Dashboard
# -----------------------------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def stats_dashboard(request):
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
# Activities
# -----------------------------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_activities(request):
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
# Reservations
# -----------------------------
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def reservations(request):
    if request.method == "GET":
        role = get_user_role(request.user)
        qs = Reservation.objects.select_related("ouvrage", "adherent__user")
        if role == UserRole.LECTEUR:
            qs = qs.filter(adherent__user=request.user)

        statut = request.query_params.get("statut")
        if statut:
            qs = qs.filter(statut=statut)

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

    reservation, created = Reservation.objects.get_or_create(
        adherent=adherent,
        ouvrage=ouvrage,
        statut=StatutReservation.EN_ATTENTE,
    )
    if not created:
        return Response(
            {"detail": "Reservation deja existante."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response(ReservationSerializer(reservation).data, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([IsLecteur])
def annuler_reservation(request, reservation_id: int):
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
def honorer_reservation(request, reservation_id: int):
    try:
        reservation = Reservation.objects.get(id=reservation_id)
    except Reservation.DoesNotExist:
        return Response({"detail": "Reservation introuvable."}, status=status.HTTP_404_NOT_FOUND)

    if reservation.statut != StatutReservation.EN_ATTENTE:
        return Response({"detail": "Reservation non modifiable."}, status=status.HTTP_400_BAD_REQUEST)

    reservation.statut = StatutReservation.HONOREE
    reservation.date_traitement = timezone.now()
    reservation.save(update_fields=["statut", "date_traitement"])
    return Response(ReservationSerializer(reservation).data, status=status.HTTP_200_OK)
