# Generated by Django 5.0.7 on 2024-10-02 13:03

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('journals', '0005_alter_purchaseentries_purchase'),
    ]

    operations = [
        migrations.AddField(
            model_name='purchasereturnentries',
            name='stock',
            field=models.ForeignKey(default='a342c43a-7f2d-449d-84e4-2a630674f372', on_delete=django.db.models.deletion.CASCADE, related_name='purchase_return_entries', to='journals.stock'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='salesreturnentries',
            name='stock',
            field=models.ForeignKey(default='a342c43a-7f2d-449d-84e4-2a630674f372', on_delete=django.db.models.deletion.CASCADE, related_name='sales_return_entries', to='journals.stock'),
            preserve_default=False,
        ),
    ]
