from datetime import timedelta
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone

from adherents.models import Adherent
from core.models import Parametre
from exemplaires.models import EtatExemplaire, Exemplaire
from ouvrages.models import Ouvrage

from .models import Emprunt, StatutEmprunt
from .services import (
    creer_emprunt,
    generer_ou_maj_penalite,
    recalculer_tous_les_retards,
)


User = get_user_model()


class EmpruntServiceTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="lecteur", password="pass")
        self.adherent = Adherent.objects.create(user=self.user, adresse="Test", telephone="000")
        self.ouvrage = Ouvrage.objects.create(
            isbn="9780306406157",
            titre="Test Ouvrage",
            auteur="Auteur",
            categorie="Test",
            type_ressource="LIVRE",
            disponible=True,
        )
        self.exemplaire = Exemplaire.objects.create(
            ouvrage=self.ouvrage,
            code_barre="EX-1-TEST",
            etat=EtatExemplaire.DISPONIBLE,
        )

    def test_creer_emprunt_change_etat(self):
        emprunt = creer_emprunt(exemplaire=self.exemplaire, adherent=self.adherent)
        self.exemplaire.refresh_from_db()
        self.assertEqual(emprunt.statut, StatutEmprunt.EN_COURS)
        self.assertEqual(self.exemplaire.etat, EtatExemplaire.EMPRUNTE)

    def test_quota_emprunts_actifs(self):
        Parametre.objects.update_or_create(id=1, defaults={"quota_emprunts_actifs": 1})
        creer_emprunt(exemplaire=self.exemplaire, adherent=self.adherent)
        second_exemplaire = Exemplaire.objects.create(
            ouvrage=self.ouvrage,
            code_barre="EX-1-TEST-2",
            etat=EtatExemplaire.DISPONIBLE,
        )
        with self.assertRaises(ValueError):
            creer_emprunt(exemplaire=second_exemplaire, adherent=self.adherent)

    def test_recalcul_retards_et_penalite(self):
        emprunt = Emprunt.objects.create(
            exemplaire=self.exemplaire,
            adherent=self.adherent,
            date_retour_prevue=timezone.localdate() - timedelta(days=3),
            statut=StatutEmprunt.EN_COURS,
        )
        recalculer_tous_les_retards()
        emprunt.refresh_from_db()
        self.assertEqual(emprunt.statut, StatutEmprunt.EN_RETARD)
        penalite = generer_ou_maj_penalite(emprunt)
        self.assertIsNotNone(penalite)
        self.assertGreater(penalite.jours_retard, 0)
