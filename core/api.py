from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from emprunts.models import Reservation, Penalite, StatutReservation
from ouvrages.models import Ebook
from users.views import IsAdminOrBibliothecaire
from .models import Paiement, StatutPaiement, TypePaiement
from .serializers import PaiementSerializer


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def initier_paiement(request):
    # Initie un paiement (optionnel).
    data = request.data
    type_paiement = data.get("type")
    reference_objet = data.get("reference_objet")
    montant = data.get("montant")

    if not type_paiement or not reference_objet or montant is None:
        return Response({"detail": "Donnees invalides."}, status=status.HTTP_400_BAD_REQUEST)

    paiement = Paiement.objects.create(
        user=request.user,
        type=type_paiement,
        reference_objet=reference_objet,
        montant=montant,
        statut=StatutPaiement.INITIE,
    )
    return Response(PaiementSerializer(paiement).data, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def payer(request, paiement_id: int):
    # Paiement simule.
    try:
        paiement = Paiement.objects.get(id=paiement_id)
    except Paiement.DoesNotExist:
        return Response({"detail": "Paiement introuvable."}, status=status.HTTP_404_NOT_FOUND)

    if paiement.statut == StatutPaiement.PAYE:
        return Response(PaiementSerializer(paiement).data, status=status.HTTP_200_OK)

    is_staff = IsAdminOrBibliothecaire().has_permission(request, None)
    if paiement.user != request.user and not is_staff:
        return Response({"detail": "Acces interdit."}, status=status.HTTP_403_FORBIDDEN)

    paiement.statut = StatutPaiement.PAYE
    paiement.date_paiement = timezone.now()
    paiement.save(update_fields=["statut", "date_paiement"])

    if paiement.type == TypePaiement.RESERVATION:
        reservation = Reservation.objects.filter(id=paiement.reference_objet).first()
        if reservation and reservation.statut == StatutReservation.EN_ATTENTE:
            reservation.statut = StatutReservation.VALIDEE
            reservation.date_traitement = timezone.now()
            reservation.save(update_fields=["statut", "date_traitement"])

    if paiement.type == TypePaiement.PENALITE:
        penalite = Penalite.objects.filter(id=paiement.reference_objet).first()
        if penalite and not penalite.payee:
            penalite.payee = True
            penalite.save(update_fields=["payee"])

    if paiement.type == TypePaiement.EBOOK:
        Ebook.objects.filter(id=paiement.reference_objet).exists()

    return Response(PaiementSerializer(paiement).data, status=status.HTTP_200_OK)
