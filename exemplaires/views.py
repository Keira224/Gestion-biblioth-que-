# Role de ce fichier: endpoints DRF pour exemplaires.
from django.db.models import Count, Q
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.models import ActivityType, log_activity
from core.views import apply_ordering, paginate_queryset
from users.views import IsAdminOrBibliothecaire

from ouvrages.models import Ouvrage

from .models import EtatExemplaire, Exemplaire, generate_code_barre
from .serializers import ExemplaireDisponibleSerializer, ExemplaireSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def exemplaires_disponibles(request):
    # Ce que ca fait: liste des exemplaires disponibles.
    # Permissions: authentifie.
    # Payload: query params (ordering, page, page_size).
    # Reponse: liste paginee d'exemplaires.
    qs = Exemplaire.objects.filter(etat=EtatExemplaire.DISPONIBLE).select_related("ouvrage")
    q = request.query_params.get("q")
    if q:
        qs = qs.filter(
            Q(code_barre__icontains=q)
            | Q(ouvrage__titre__icontains=q)
            | Q(ouvrage__auteur__icontains=q)
            | Q(ouvrage__isbn__icontains=q)
        )
    qs = apply_ordering(
        qs,
        request,
        allowed_fields=["code_barre", "ouvrage__titre", "ouvrage__auteur"],
        default="ouvrage__titre",
    )
    items, meta = paginate_queryset(qs, request, default_page_size=20)
    return Response({"results": ExemplaireDisponibleSerializer(items, many=True).data, "pagination": meta})


@api_view(["GET", "POST"])
@permission_classes([IsAdminOrBibliothecaire])
def exemplaires_par_ouvrage(request, ouvrage_id: int):
    # Ce que ca fait: liste ou ajout d'exemplaires pour un ouvrage.
    # Permissions: ADMIN/BIBLIOTHECAIRE.
    # Payload POST: { nombre }.
    # Reponse: liste paginee ou confirmation d'ajout.
    try:
        ouvrage = Ouvrage.objects.get(id=ouvrage_id)
    except Ouvrage.DoesNotExist:
        return Response({"detail": "Ouvrage introuvable."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        qs = (
            Exemplaire.objects.filter(ouvrage=ouvrage)
            .select_related("ouvrage")
            .annotate(emprunts_count=Count("emprunts"))
            .order_by("code_barre")
        )
        search = request.query_params.get("search")
        if search:
            qs = qs.filter(code_barre__icontains=search)
        etat = request.query_params.get("etat")
        if etat:
            qs = qs.filter(etat=etat)
        items, meta = paginate_queryset(qs, request, default_page_size=20)
        return Response({"results": ExemplaireSerializer(items, many=True).data, "pagination": meta})

    try:
        nombre = int(request.data.get("nombre", 1))
    except (TypeError, ValueError):
        return Response({"detail": "Nombre invalide."}, status=status.HTTP_400_BAD_REQUEST)

    if nombre <= 0:
        return Response({"detail": "Nombre invalide."}, status=status.HTTP_400_BAD_REQUEST)

    for _ in range(nombre):
        Exemplaire.objects.create(
            ouvrage=ouvrage,
            code_barre=generate_code_barre(ouvrage.id),
        )

    log_activity(
        type=ActivityType.EXEMPLAIRE_AJOUTE,
        message=f"Exemplaires ajoutes: {nombre} pour {ouvrage.titre}",
        user=request.user,
    )

    return Response({"ajoutes": nombre}, status=status.HTTP_201_CREATED)


@api_view(["DELETE"])
@permission_classes([IsAdminOrBibliothecaire])
def exemplaire_detail(request, exemplaire_id: int):
    # Ce que ca fait: suppression d'un exemplaire.
    # Permissions: ADMIN/BIBLIOTHECAIRE.
    # Payload: none.
    # Reponse: 204 ou erreur.
    try:
        exemplaire = Exemplaire.objects.get(id=exemplaire_id)
    except Exemplaire.DoesNotExist:
        return Response({"detail": "Exemplaire introuvable."}, status=status.HTTP_404_NOT_FOUND)

    if exemplaire.emprunts.exists():
        return Response(
            {"detail": "Impossible de supprimer un exemplaire deja emprunte."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if exemplaire.etat != EtatExemplaire.DISPONIBLE:
        return Response(
            {"detail": "Seuls les exemplaires disponibles peuvent etre supprimes."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    exemplaire.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
