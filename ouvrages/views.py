# Role de ce fichier: endpoints DRF pour le catalogue (ouvrages).
from django.db.models import Count, Q
from django.db.models.deletion import ProtectedError
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from django.utils import timezone

from core.models import ActivityType, log_activity
from core.views import apply_ordering, paginate_queryset
from exemplaires.models import EtatExemplaire, Exemplaire, generate_code_barre
from users.views import IsAdminOrBibliothecaire, IsLecteur
from core.models import Paiement, StatutPaiement, TypePaiement

from .models import Ouvrage, DemandeLivre, Ebook
from .serializers import (
    OuvrageCreateSerializer,
    OuvrageSerializer,
    OuvrageUpdateSerializer,
    DemandeLivreSerializer,
    DemandeLivreCreateSerializer,
    DemandeLivreStatusSerializer,
    EbookSerializer,
    EbookCreateSerializer,
)


def annotate_ouvrages(qs):
    # Ajoute les compteurs d'exemplaires pour l'affichage.
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
    # Ce que ca fait: liste ou creation d'ouvrages.
    # Permissions: GET auth, POST admin/biblio.
    # Payload POST: champs ouvrage + nombre_exemplaires.
    # Reponse: liste paginee ou ouvrage cree.
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

        log_activity(
            type=ActivityType.OUVRAGE_AJOUTE,
            message=f"Ouvrage ajoute: {ouvrage.titre}",
            user=request.user,
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
    # Ce que ca fait: detail / update / delete d'un ouvrage.
    # Permissions: GET auth, PATCH/DELETE admin/biblio.
    # Payload PATCH: champs ouvrage.
    # Reponse: detail ou 204.
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


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def demandes_livres(request):
    # Liste ou creation des demandes de livres.
    if request.method == "GET":
        if IsAdminOrBibliothecaire().has_permission(request, None):
            qs = DemandeLivre.objects.select_related("adherent__user", "ouvrage")
        else:
            qs = DemandeLivre.objects.filter(adherent__user=request.user).select_related("adherent__user", "ouvrage")
        qs = apply_ordering(
            qs,
            request,
            allowed_fields=["date_creation", "statut", "titre"],
            default="-date_creation",
        )
        items, meta = paginate_queryset(qs, request, default_page_size=10)
        return Response({"results": DemandeLivreSerializer(items, many=True).data, "pagination": meta})

    if not IsLecteur().has_permission(request, None):
        return Response({"detail": "Acces interdit."}, status=status.HTTP_403_FORBIDDEN)

    serializer = DemandeLivreCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    demande = serializer.save(adherent=request.user.adherent)
    return Response(DemandeLivreSerializer(demande).data, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([IsLecteur])
def mes_demandes_livres(request):
    # Liste des demandes du lecteur.
    qs = DemandeLivre.objects.filter(adherent__user=request.user).select_related("adherent__user", "ouvrage")
    qs = apply_ordering(qs, request, allowed_fields=["date_creation", "statut"], default="-date_creation")
    items, meta = paginate_queryset(qs, request, default_page_size=10)
    return Response({"results": DemandeLivreSerializer(items, many=True).data, "pagination": meta})


@api_view(["POST"])
@permission_classes([IsAdminOrBibliothecaire])
def demande_livre_status(request, demande_id: int):
    # Mise a jour du statut d'une demande.
    try:
        demande = DemandeLivre.objects.get(id=demande_id)
    except DemandeLivre.DoesNotExist:
        return Response({"detail": "Demande introuvable."}, status=status.HTTP_404_NOT_FOUND)

    serializer = DemandeLivreStatusSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data
    demande.statut = data["statut"]

    ouvrage_id = data.get("ouvrage_id")
    if ouvrage_id:
        try:
            demande.ouvrage = Ouvrage.objects.get(id=ouvrage_id)
        except Ouvrage.DoesNotExist:
            return Response({"detail": "Ouvrage introuvable."}, status=status.HTTP_404_NOT_FOUND)

    demande.date_traitement = timezone.now()
    demande.save(update_fields=["statut", "ouvrage", "date_traitement"])
    return Response(DemandeLivreSerializer(demande).data, status=status.HTTP_200_OK)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def ebooks(request):
    # Liste ou creation d'ebooks.
    if request.method == "GET":
        qs = Ebook.objects.select_related("ouvrage")
        qs = apply_ordering(qs, request, allowed_fields=["nom_fichier", "format", "est_payant"], default="nom_fichier")
        items, meta = paginate_queryset(qs, request, default_page_size=10)
        return Response({"results": EbookSerializer(items, many=True).data, "pagination": meta})

    if not IsAdminOrBibliothecaire().has_permission(request, None):
        return Response({"detail": "Acces interdit."}, status=status.HTTP_403_FORBIDDEN)

    data = request.data.copy()
    if "fichier" in request.FILES and not data.get("nom_fichier"):
        data["nom_fichier"] = request.FILES["fichier"].name
    serializer = EbookCreateSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    ebook = serializer.save()
    log_activity(
        type=ActivityType.OUVRAGE_AJOUTE,
        message=f"Ebook ajoute: {ebook.nom_fichier}",
        user=request.user,
    )
    return Response(EbookSerializer(ebook).data, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def ebook_download(request, ebook_id: int):
    # Autorise le telechargement si gratuit ou paye.
    try:
        ebook = Ebook.objects.get(id=ebook_id)
    except Ebook.DoesNotExist:
        return Response({"detail": "Ebook introuvable."}, status=status.HTTP_404_NOT_FOUND)

    if ebook.est_payant:
        paye = Paiement.objects.filter(
            user=request.user,
            type=TypePaiement.EBOOK,
            reference_objet=ebook.id,
            statut=StatutPaiement.PAYE,
        ).exists()
        if not paye:
            return Response({"detail": "Paiement requis."}, status=status.HTTP_403_FORBIDDEN)

    if ebook.fichier:
        return Response({"url": ebook.fichier.url})
    if ebook.url_fichier:
        return Response({"url": ebook.url_fichier})

    return Response({"detail": "Aucun fichier disponible."}, status=status.HTTP_404_NOT_FOUND)
