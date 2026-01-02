from django.test import TestCase

from .serializers import OuvrageCreateSerializer, OuvrageUpdateSerializer


class OuvrageIsbnValidationTests(TestCase):
    def test_isbn_13_valide(self):
        serializer = OuvrageCreateSerializer(
            data={
                "isbn": "978-0-306-40615-7",
                "titre": "Test",
                "auteur": "Auteur",
                "categorie": "Test",
                "type_ressource": "LIVRE",
                "disponible": True,
            }
        )
        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data["isbn"], "9780306406157")

    def test_isbn_10_valide(self):
        serializer = OuvrageUpdateSerializer(
            data={"isbn": "0-306-40615-2"},
            partial=True,
        )
        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data["isbn"], "0306406152")

    def test_isbn_invalide(self):
        serializer = OuvrageCreateSerializer(
            data={
                "isbn": "1234",
                "titre": "Test",
                "auteur": "Auteur",
                "categorie": "Test",
                "type_ressource": "LIVRE",
                "disponible": True,
            }
        )
        self.assertFalse(serializer.is_valid())
        self.assertIn("isbn", serializer.errors)
