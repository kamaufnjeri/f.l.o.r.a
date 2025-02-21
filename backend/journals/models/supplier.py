from .base_model import BaseModel
from django.db import models
from .account import Account

class Supplier(BaseModel):
    name = models.CharField(max_length=200)
    email = models.EmailField()
    phone_number = models.IntegerField()
    account = models.OneToOneField(Account, related_name="supplier", null=True, on_delete=models.CASCADE)
    organisation = models.ForeignKey('Organisation', related_name='suppliers', on_delete=models.CASCADE)
    user = models.ForeignKey('FloraUser', related_name='suppliers', on_delete=models.SET_NULL, null=True)


    def __str__(self):
        return self.name