# Generated by Django 5.0.7 on 2024-11-06 10:30

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('journals', '0017_fixedgroup_remove_account_category_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='account',
            name='belongs_to',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='accounts', to='journals.subcategory'),
        ),
    ]