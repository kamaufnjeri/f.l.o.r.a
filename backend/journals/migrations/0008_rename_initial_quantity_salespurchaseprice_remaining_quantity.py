# Generated by Django 5.0.7 on 2024-10-02 16:15

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('journals', '0007_rename_initial_quantity_salesentries_remaining_quantity'),
    ]

    operations = [
        migrations.RenameField(
            model_name='salespurchaseprice',
            old_name='initial_quantity',
            new_name='remaining_quantity',
        ),
    ]
