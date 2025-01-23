from .base_model import BaseModel
from django.db import models
from .account import Account
from .purchase import Purchase


class PurchaseReturn(BaseModel):
    date = models.DateField()
    description = models.TextField()
    purchase = models.ForeignKey(Purchase, related_name='purchase_returns', on_delete=models.CASCADE)
    organisation = models.ForeignKey('Organisation', related_name='purchase_returns', on_delete=models.CASCADE)
    user = models.ForeignKey('FloraUser', related_name='purchase_returns', on_delete=models.SET_NULL, null=True)
    bill_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0, blank=True, null=True)
    return_total = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)


    def __str__(self):
        return self.description