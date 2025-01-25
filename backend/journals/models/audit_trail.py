from django.db import models
from .base_model import BaseModel

class AuditTrail(BaseModel):
    ACTION_CHOICES = [
        ('ADD', 'Add'),
        ('EDIT', 'Edit'),
        ('DELETE', 'Delete'),
    ]

    action = models.CharField(max_length=60, choices=ACTION_CHOICES)
    model_name = models.CharField(max_length=255)
    object_id =  models.UUIDField(editable=False)
    changed_by = models.ForeignKey('FloraUser', on_delete=models.SET_NULL, null=True, blank=True)
    organisation = models.ForeignKey('Organisation', on_delete=models.SET_NULL, null=True, blank=True)
    before = models.JSONField(null=True, blank=True)  # Before data (on Edit/Delete)
    after = models.JSONField(null=True, blank=True)   # After data (on Add/Edit)


    def __str__(self):
        return f"{self.model_name} ({self.action}) by {self.changed_by}"
