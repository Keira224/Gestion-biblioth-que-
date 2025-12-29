# Role de ce fichier: endpoints DRF pour les adherents.
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from core.views import apply_ordering, paginate_queryset
from users.views import IsAdminOrBibliothecaire

from .models import Adherent
from .serializers import AdherentListSerializer


@api_view(["GET"])
@permission_classes([IsAdminOrBibliothecaire])
def liste_adherents(request):
    # Ce que ca fait: liste paginee des adherents.
    # Permissions: ADMIN/BIBLIOTHECAIRE.
    # Payload: query params (ordering, page, page_size).
    # Reponse: liste + pagination.
    qs = Adherent.objects.select_related("user")
    qs = apply_ordering(
        qs,
        request,
        allowed_fields=["date_inscription", "user__username"],
        default="user__username",
    )
    items, meta = paginate_queryset(qs, request, default_page_size=20)
    return Response({"results": AdherentListSerializer(items, many=True).data, "pagination": meta})
