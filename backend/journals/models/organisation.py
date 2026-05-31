from django.db import models
from .base_model import BaseModel


class Organisation(BaseModel):
    org_name = models.CharField(max_length=200)
    org_email = models.EmailField(unique=True)
    org_phone_number = models.CharField(max_length=15)
    country = models.CharField(max_length=200)
    currency = models.CharField(max_length=200)
    org_admin = models.ForeignKey('FloraUser', related_name='org_admin', on_delete=models.SET_NULL, null=True)


    def __str__(self):
        return self.org_name