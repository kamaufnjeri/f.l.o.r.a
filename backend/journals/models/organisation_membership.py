from django.db import models
from .base_model import BaseModel
from .user import FloraUser
from .organisation import Organisation

class OrganisationMembership(BaseModel):
    ROLES = (
        ("admin", "Admin"),
        ("staff", "Staff")
    )
    organisation = models.ForeignKey(Organisation, related_name='org_membership', on_delete=models.CASCADE)
    user = models.ForeignKey(FloraUser, related_name='org_membership', on_delete=models.CASCADE, null=True, blank=True)
    role = models.CharField(max_length=200, choices=ROLES)
    is_active = models.BooleanField(default=False)
    invite_data = models.JSONField(null=True, blank=True)



    def __str__(self):
        return self.role