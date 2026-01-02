# Role de ce fichier: modele Exemplaire + helpers.
from io import BytesIO
from uuid import uuid4

from django.core.files.base import ContentFile
from django.db import models
from PIL import Image, ImageDraw
from ouvrages.models import Ouvrage


class EtatExemplaire(models.TextChoices):
    # Etats possibles d'un exemplaire.
    DISPONIBLE = "DISPONIBLE", "Disponible"
    EMPRUNTE = "EMPRUNTE", "Emprunté"
    PERDU = "PERDU", "Perdu"
    ENDOMMAGE = "ENDOMMAGE", "Endommagé"


class Exemplaire(models.Model):
    # Exemplaire physique associe a un ouvrage.
    ouvrage = models.ForeignKey(
        Ouvrage,
        on_delete=models.CASCADE,
        related_name="exemplaires"
    )

    code_barre = models.CharField(
        max_length=50,
        unique=True
    )

    code_barre_image = models.ImageField(
        upload_to="exemplaires/barcodes/",
        blank=True,
        null=True,
    )

    etat = models.CharField(
        max_length=20,
        choices=EtatExemplaire.choices,
        default=EtatExemplaire.DISPONIBLE
    )

    def save(self, *args, **kwargs):
        if self.code_barre and not self.code_barre_image:
            image = generate_code_barre_image(self.code_barre)
            filename = f"{self.code_barre}.png"
            self.code_barre_image.save(filename, image, save=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.code_barre} - {self.ouvrage.titre}"


def generate_code_barre(ouvrage_id: int) -> str:
    # Helper: genere un code unique pour un exemplaire.
    while True:
        code = f"EX-{ouvrage_id}-{uuid4().hex[:8]}"
        if not Exemplaire.objects.filter(code_barre=code).exists():
            return code


CODE39_PATTERNS = {
    "0": "nnnwwnwnn",
    "1": "wnnwnnnnw",
    "2": "nnwwnnnnw",
    "3": "wnwwnnnnn",
    "4": "nnnwwnnnw",
    "5": "wnnwwnnnn",
    "6": "nnwwwnnnn",
    "7": "nnnwnnwnw",
    "8": "wnnwnnwnn",
    "9": "nnwwnnwnn",
    "A": "wnnnnwnnw",
    "B": "nnwnnwnnw",
    "C": "wnwnnwnnn",
    "D": "nnnnwwnnw",
    "E": "wnnnwwnnn",
    "F": "nnwnwwnnn",
    "G": "nnnnnwwnw",
    "H": "wnnnnwwnn",
    "I": "nnwnnwwnn",
    "J": "nnnnwwwnn",
    "K": "wnnnnnnww",
    "L": "nnwnnnnww",
    "M": "wnwnnnnwn",
    "N": "nnnnwnnww",
    "O": "wnnnwnnwn",
    "P": "nnwnwnnwn",
    "Q": "nnnnnnwww",
    "R": "wnnnnnwwn",
    "S": "nnwnnnwwn",
    "T": "nnnnwnwwn",
    "U": "wwnnnnnnw",
    "V": "nwwnnnnnw",
    "W": "wwwnnnnnn",
    "X": "nwnnwnnnw",
    "Y": "wwnnwnnnn",
    "Z": "nwwnwnnnn",
    "-": "nwnnnnwnw",
    ".": "wwnnnnwnn",
    " ": "nwwnnnwnn",
    "$": "nwnwnwnnn",
    "/": "nwnwnnnwn",
    "+": "nwnnnwnwn",
    "%": "nnnwnwnwn",
    "*": "nwnnwnwnn",
}


def _code39_payload(code: str) -> str:
    allowed = set(CODE39_PATTERNS.keys())
    normalized = code.upper()
    if any(char not in allowed for char in normalized):
        normalized = "".join(char if char in allowed else "-" for char in normalized)
    return f"*{normalized}*"


def generate_code_barre_image(code: str) -> ContentFile:
    # Genere un code-barres Code39 simple (PNG).
    payload = _code39_payload(code)
    narrow = 2
    wide = 5
    gap = 2
    height = 80
    quiet_zone = 10

    total_width = quiet_zone * 2
    for char in payload:
        pattern = CODE39_PATTERNS[char]
        for symbol in pattern:
            total_width += wide if symbol == "w" else narrow
        total_width += gap

    image = Image.new("RGB", (total_width, height), "white")
    draw = ImageDraw.Draw(image)

    x = quiet_zone
    for char in payload:
        pattern = CODE39_PATTERNS[char]
        for idx, symbol in enumerate(pattern):
            width = wide if symbol == "w" else narrow
            if idx % 2 == 0:
                draw.rectangle([x, 0, x + width - 1, height], fill="black")
            x += width
        x += gap

    buffer = BytesIO()
    image.save(buffer, format="PNG")
    return ContentFile(buffer.getvalue())
