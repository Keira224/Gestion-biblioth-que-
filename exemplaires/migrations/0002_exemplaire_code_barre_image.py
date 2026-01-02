from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("exemplaires", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="exemplaire",
            name="code_barre_image",
            field=models.ImageField(blank=True, null=True, upload_to="exemplaires/barcodes/"),
        ),
    ]
