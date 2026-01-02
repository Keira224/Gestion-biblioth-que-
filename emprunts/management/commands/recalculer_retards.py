from django.core.management.base import BaseCommand

from emprunts.models import Emprunt, StatutEmprunt
from emprunts.services import generer_ou_maj_penalite, recalculer_tous_les_retards


class Command(BaseCommand):
    help = "Recalcule les statuts de retard et met a jour les penalites."

    def handle(self, *args, **options):
        total = recalculer_tous_les_retards()
        penalites = 0
        for emprunt in Emprunt.objects.filter(statut=StatutEmprunt.EN_RETARD):
            if generer_ou_maj_penalite(emprunt):
                penalites += 1
        self.stdout.write(
            self.style.SUCCESS(
                f"Retards recalcules: {total}. Penalites traitees: {penalites}."
            )
        )
