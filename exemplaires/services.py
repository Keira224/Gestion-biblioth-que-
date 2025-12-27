from uuid import uuid4

from .models import Exemplaire


def generate_code_barre(ouvrage_id: int) -> str:
    while True:
        code = f"EX-{ouvrage_id}-{uuid4().hex[:8]}"
        if not Exemplaire.objects.filter(code_barre=code).exists():
            return code
