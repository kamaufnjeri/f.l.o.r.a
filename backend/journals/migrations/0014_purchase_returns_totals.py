# Generated by Django 5.0.7 on 2024-10-31 06:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('journals', '0013_purchasereturnentries_return_price_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='purchase',
            name='returns_totals',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=15),
        ),
    ]
