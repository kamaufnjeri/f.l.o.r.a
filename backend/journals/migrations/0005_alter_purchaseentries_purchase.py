# Generated by Django 5.0.7 on 2024-09-26 13:19

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('journals', '0004_bill_serial_number_invoice_serial_number_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='purchaseentries',
            name='purchase',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='purchase_entries', to='journals.purchase'),
        ),
    ]
