# Generated by Django 5.0.7 on 2024-10-31 07:01

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('journals', '0014_purchase_returns_totals'),
    ]

    operations = [
        migrations.RenameField(
            model_name='purchase',
            old_name='returns_totals',
            new_name='returns_total',
        ),
    ]
