from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("ouvrages", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="ouvrage",
            name="type_ressource",
            field=models.CharField(
                choices=[
                    ("LIVRE", "Livre"),
                    ("DVD", "DVD"),
                    ("RESSOURCE_NUMERIQUE", "Ressource numerique"),
                ],
                default="LIVRE",
                max_length=30,
            ),
        ),
    ]
