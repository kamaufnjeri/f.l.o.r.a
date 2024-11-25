from .base_model import BaseModel
from django.db import models


class AuditTrail(BaseModel):
    organisation = models.ForeignKey('Organisation', related_name='audit_trail', on_delete=models.CASCADE, null=True)
    action = models.CharField(max_length=15, choices=(('Delete', 'delete'), ('Update', 'update')))
    table = models.CharField(max_length=120)
    original_json = models.JSONField()
    new_json = models.JSONField(null=True, blank=True)
    user = models.ForeignKey('FloraUser', related_name='audit_trail', on_delete=models.SET_NULL, null=True)
    

