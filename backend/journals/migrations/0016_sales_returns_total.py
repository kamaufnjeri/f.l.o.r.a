# Generated by Django 5.0.7 on 2024-10-31 08:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('journals', '0015_rename_returns_totals_purchase_returns_total'),
    ]

    operations = [
        migrations.AddField(
            model_name='sales',
            name='returns_total',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=15),
        ),
    ]
