from .base_model import BaseModel
from django.db import models
from .account import Account
from .purchase import Purchase


class PurchaseReturn(BaseModel):
    date = models.DateField()
    description = models.TextField()
    purchase = models.ForeignKey(Purchase, related_name='purchase_return', on_delete=models.CASCADE)
    

    def __str__(self):
        return self.description