# Generated by Django 5.0.7 on 2024-11-06 12:43

import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('journals', '0017_fixedgroup_remove_account_category_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='ServiceIncome',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('date', models.DateField()),
                ('description', models.TextField()),
                ('serial_number', models.CharField(max_length=200)),
                ('organisation', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='service_incomes', to='journals.organisation')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='service_incomes', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.AddField(
            model_name='invoice',
            name='service_income',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='invoice', to='journals.serviceincome'),
        ),
        migrations.CreateModel(
            name='ServiceIncomeEntry',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('quantity', models.IntegerField(default=1)),
                ('price', models.DecimalField(decimal_places=2, max_digits=15)),
                ('service', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='service_income_entries', to='journals.service')),
                ('service_income', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='service_inocme_entries', to='journals.serviceincome')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
