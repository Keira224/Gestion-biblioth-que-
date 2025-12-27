from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("adherents", "0001_initial"),
        ("ouvrages", "0001_initial"),
        ("emprunts", "0002_penalite"),
    ]

    operations = [
        migrations.CreateModel(
            name="Reservation",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                (
                    "statut",
                    models.CharField(
                        choices=[
                            ("EN_ATTENTE", "En attente"),
                            ("ANNULEE", "Annulee"),
                            ("HONOREE", "Honoree"),
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
                        related_name="reservations",
                        to="adherents.adherent",
                    ),
                ),
                (
                    "ouvrage",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="reservations",
                        to="ouvrages.ouvrage",
                    ),
                ),
            ],
        ),
        migrations.AddConstraint(
            model_name="reservation",
            constraint=models.UniqueConstraint(
                condition=models.Q(("statut", "EN_ATTENTE")),
                fields=("adherent", "ouvrage"),
                name="unique_active_reservation",
            ),
        ),
    ]
