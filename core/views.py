# Role de ce fichier: utilitaires partages pour les vues DRF (tri, pagination).
import math


# Utilitaire: applique un tri controle depuis la query string.
def apply_ordering(qs, request, allowed_fields, default):
    # Permission: aucun controle ici, la vue appelante gere l'acces.
    ordering = request.query_params.get("ordering", default)
    if not ordering:
        return qs

    field = ordering.lstrip("-")
    if field not in allowed_fields:
        return qs.order_by(default)
    return qs.order_by(ordering)


# Utilitaire: pagination simple pour reponses API.
def paginate_queryset(qs, request, *, default_page_size=10, max_page_size=100):
    # Payload: ?page=&page_size= ; Reponse: (items, meta pagination).
    try:
        page = int(request.query_params.get("page", 1))
    except ValueError:
        page = 1
    try:
        page_size = int(request.query_params.get("page_size", default_page_size))
    except ValueError:
        page_size = default_page_size

    page = max(page, 1)
    page_size = max(1, min(page_size, max_page_size))

    total = qs.count()
    pages = max(1, math.ceil(total / page_size))
    offset = (page - 1) * page_size

    return (
        qs[offset:offset + page_size],
        {"page": page, "page_size": page_size, "total": total, "pages": pages},
    )
