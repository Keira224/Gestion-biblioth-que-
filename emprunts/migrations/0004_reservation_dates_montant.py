from django.db import migrations, models
import django.utils.timezone


def map_reservation_status(apps, schema_editor):
    Reservation = apps.get_model("emprunts", "Reservation")
    Reservation.objects.filter(statut="HONOREE").update(statut="VALIDEE")


def reverse_map_reservation_status(apps, schema_editor):
    Reservation = apps.get_model("emprunts", "Reservation")
    Reservation.objects.filter(statut="VALIDEE").update(statut="HONOREE")


class Migration(migrations.Migration):

    dependencies = [
        ("emprunts", "0003_reservation"),
    ]

    operations = [
        migrations.AddField(
            model_name="reservation",
            name="date_debut",
            field=models.DateField(default=django.utils.timezone.localdate),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="reservation",
            name="date_fin",
            field=models.DateField(default=django.utils.timezone.localdate),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="reservation",
            name="montant_estime",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
        ),
        migrations.RunPython(map_reservation_status, reverse_map_reservation_status),
        migrations.AlterField(
            model_name="reservation",
            name="statut",
            field=models.CharField(
                choices=[
                    ("EN_ATTENTE", "En attente"),
                    ("VALIDEE", "Validee"),
                    ("REFUSEE", "Refusee"),
                    ("ANNULEE", "Annulee"),
                    ("EXPIREE", "Expiree"),
                    ("REMISE", "Remise"),
                ],
                default="EN_ATTENTE",
                max_length=20,
            ),
        ),
        migrations.RemoveConstraint(
            model_name="reservation",
            name="unique_active_reservation",
        ),
        migrations.AddConstraint(
            model_name="reservation",
            constraint=models.UniqueConstraint(
                condition=models.Q(("statut", "EN_ATTENTE")),
                fields=("adherent", "ouvrage", "date_debut", "date_fin"),
                name="unique_active_reservation",
            ),
        ),
    ]
