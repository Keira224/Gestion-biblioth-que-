from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("ouvrages", "0002_type_ressource"),
        ("adherents", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="DemandeLivre",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("titre", models.CharField(max_length=255)),
                ("auteur", models.CharField(blank=True, max_length=255, null=True)),
                ("isbn", models.CharField(blank=True, max_length=20, null=True)),
                ("description", models.TextField(blank=True, null=True)),
                ("urgence", models.CharField(blank=True, max_length=50, null=True)),
                (
                    "statut",
                    models.CharField(
                        choices=[
                            ("EN_ATTENTE", "En attente"),
                            ("EN_RECHERCHE", "En recherche"),
                            ("TROUVE", "Trouve"),
                            ("INDISPONIBLE", "Indisponible"),
                            ("CLOTUREE", "Cloturee"),
                        ],
                        default="EN_ATTENTE",
                        max_length=20,
                    ),
                ),
                ("date_creation", models.DateTimeField(auto_now_add=True)),
                ("date_traitement", models.DateTimeField(blank=True, null=True)),
                (
                    "adherent",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="demandes_livres",
                        to="adherents.adherent",
                    ),
                ),
                (
                    "ouvrage",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="demandes",
                        to="ouvrages.ouvrage",
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="Ebook",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("fichier", models.FileField(blank=True, null=True, upload_to="ebooks/")),
                ("url_fichier", models.URLField(blank=True, null=True)),
                (
                    "format",
                    models.CharField(
                        choices=[("PDF", "PDF"), ("EPUB", "EPUB")],
                        max_length=10,
                    ),
                ),
                ("taille", models.PositiveIntegerField(blank=True, null=True)),
                ("nom_fichier", models.CharField(max_length=255)),
                ("est_payant", models.BooleanField(default=False)),
                ("prix", models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ("date_ajout", models.DateTimeField(auto_now_add=True)),
                (
                    "ouvrage",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="ebooks",
                        to="ouvrages.ouvrage",
                    ),
                ),
            ],
        ),
    ]
