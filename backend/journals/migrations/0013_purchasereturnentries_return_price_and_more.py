# Generated by Django 5.0.7 on 2024-10-29 13:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('journals', '0012_remove_salesentries_cogs_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='purchasereturnentries',
            name='return_price',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=15),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='salesreturnentries',
            name='return_price',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=15),
            preserve_default=False,
        ),
    ]