from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0003_alter_activity_type"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name="parametre",
            name="tarif_reservation_par_jour",
            field=models.DecimalField(decimal_places=2, default=1000.0, max_digits=10),
        ),
        migrations.CreateModel(
            name="Paiement",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                (
                    "type",
                    models.CharField(
                        choices=[
                            ("EBOOK", "Ebook"),
                            ("RESERVATION", "Reservation"),
                            ("PENALITE", "Penalite"),
                        ],
                        max_length=20,
                    ),
                ),
                ("reference_objet", models.PositiveIntegerField()),
                ("montant", models.DecimalField(decimal_places=2, max_digits=10)),
                (
                    "statut",
                    models.CharField(
                        choices=[
                            ("INITIE", "Initie"),
                            ("PAYE", "Paye"),
                            ("ANNULE", "Annule"),
                        ],
                        default="INITIE",
                        max_length=20,
                    ),
                ),
                ("date_paiement", models.DateTimeField(blank=True, null=True)),
                (
                    "user",
                    models.ForeignKey(on_delete=models.deletion.CASCADE, related_name="paiements", to=settings.AUTH_USER_MODEL),
                ),
            ],
        ),
    ]
