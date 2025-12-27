from django.db.models import Count, Q
from django.db.models.deletion import ProtectedError
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.api_utils import apply_ordering, paginate_queryset
from exemplaires.models import EtatExemplaire, Exemplaire
from exemplaires.services import generate_code_barre
from users.permissions import IsAdminOrBibliothecaire

from .models import Ouvrage
from .serializers import OuvrageCreateSerializer, OuvrageSerializer, OuvrageUpdateSerializer


def annotate_ouvrages(qs):
    return qs.annotate(
        exemplaires_total=Count("exemplaires"),
        exemplaires_disponibles=Count(
            "exemplaires",
            filter=Q(exemplaires__etat=EtatExemplaire.DISPONIBLE),
        ),
    )


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def ouvrages_list(request):
    if request.method == "POST":
        if not IsAdminOrBibliothecaire().has_permission(request, None):
            return Response({"detail": "Acces interdit."}, status=status.HTTP_403_FORBIDDEN)

        serializer = OuvrageCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        ouvrage = Ouvrage.objects.create(
            isbn=data["isbn"],
            titre=data["titre"],
            auteur=data["auteur"],
            editeur=data.get("editeur"),
            annee=data.get("annee"),
            categorie=data["categorie"],
            type_ressource=data.get("type_ressource", "LIVRE"),
            disponible=data.get("disponible", True),
        )

        nombre = data.get("nombre_exemplaires", 0)
        if nombre:
            exemplaires = [
                Exemplaire(ouvrage=ouvrage, code_barre=generate_code_barre(ouvrage.id))
                for _ in range(nombre)
            ]
            Exemplaire.objects.bulk_create(exemplaires)

        qs = annotate_ouvrages(Ouvrage.objects.filter(id=ouvrage.id))
        return Response(OuvrageSerializer(qs.first()).data, status=status.HTTP_201_CREATED)

    qs = annotate_ouvrages(Ouvrage.objects.all())

    search = request.query_params.get("search")
    if search:
        qs = qs.filter(
            Q(titre__icontains=search)
            | Q(auteur__icontains=search)
            | Q(isbn__icontains=search)
            | Q(categorie__icontains=search)
        )

    titre = request.query_params.get("titre")
    if titre:
        qs = qs.filter(titre__icontains=titre)

    auteur = request.query_params.get("auteur")
    if auteur:
        qs = qs.filter(auteur__icontains=auteur)

    isbn = request.query_params.get("isbn")
    if isbn:
        qs = qs.filter(isbn__icontains=isbn)

    categorie = request.query_params.get("categorie")
    if categorie:
        qs = qs.filter(categorie__icontains=categorie)

    type_ressource = request.query_params.get("type_ressource")
    if type_ressource:
        qs = qs.filter(type_ressource=type_ressource)

    disponible = request.query_params.get("disponible")
    if disponible in {"true", "false"}:
        qs = qs.filter(disponible=(disponible == "true"))

    qs = apply_ordering(
        qs,
        request,
        allowed_fields=["titre", "auteur", "annee", "categorie", "isbn", "type_ressource"],
        default="titre",
    )

    items, meta = paginate_queryset(qs, request, default_page_size=10)
    return Response({"results": OuvrageSerializer(items, many=True).data, "pagination": meta})


@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def ouvrage_detail(request, ouvrage_id: int):
    try:
        ouvrage = Ouvrage.objects.get(id=ouvrage_id)
    except Ouvrage.DoesNotExist:
        return Response({"detail": "Ouvrage introuvable."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        qs = annotate_ouvrages(Ouvrage.objects.filter(id=ouvrage_id))
        return Response(OuvrageSerializer(qs.first()).data)

    if not IsAdminOrBibliothecaire().has_permission(request, None):
        return Response({"detail": "Acces interdit."}, status=status.HTTP_403_FORBIDDEN)

    if request.method == "PATCH":
        serializer = OuvrageUpdateSerializer(instance=ouvrage, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        qs = annotate_ouvrages(Ouvrage.objects.filter(id=ouvrage_id))
        return Response(OuvrageSerializer(qs.first()).data)

    try:
        ouvrage.delete()
    except ProtectedError:
        return Response(
            {"detail": "Impossible de supprimer un ouvrage avec des emprunts."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response(status=status.HTTP_204_NO_CONTENT)
