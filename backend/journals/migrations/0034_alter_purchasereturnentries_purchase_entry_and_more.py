# Generated by Django 5.0.7 on 2025-01-23 11:04

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('journals', '0033_alter_purchasereturnentries_purchase_entry_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='purchasereturnentries',
            name='purchase_entry',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='return_entries', to='journals.purchaseentries'),
        ),
        migrations.AlterField(
            model_name='purchasereturnentries',
            name='purchase_return',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='return_entries', to='journals.purchasereturn'),
        ),
    ]
