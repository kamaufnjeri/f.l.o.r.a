# Generated by Django 5.0.7 on 2025-01-25 12:32

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('journals', '0035_salesreturnentries_cogs'),
    ]

    operations = [
        migrations.RenameField(
            model_name='audittrail',
            old_name='new_json',
            new_name='after',
        ),
        migrations.RemoveField(
            model_name='audittrail',
            name='organisation',
        ),
        migrations.RemoveField(
            model_name='audittrail',
            name='original_json',
        ),
        migrations.RemoveField(
            model_name='audittrail',
            name='table',
        ),
        migrations.RemoveField(
            model_name='audittrail',
            name='user',
        ),
        migrations.AddField(
            model_name='audittrail',
            name='before',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='audittrail',
            name='changed_by',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='audittrail',
            name='model_name',
            field=models.CharField(default='default', max_length=255),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='audittrail',
            name='object_id',
            field=models.UUIDField(default='f47a9a3e-bdb9-4c65-84b6-8cf5408bb315', editable=False, unique=True),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='audittrail',
            name='action',
            field=models.CharField(choices=[('ADD', 'Add'), ('EDIT', 'Edit'), ('DELETE', 'Delete')], max_length=60),
        ),
    ]
