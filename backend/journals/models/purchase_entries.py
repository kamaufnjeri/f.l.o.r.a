from .base_model import BaseModel
from django.db import models
from .purchase import Purchase
from .stock import Stock


class PurchaseEntries(BaseModel):
    purchase = models.ForeignKey(Purchase, related_name='purchase_entries', on_delete=models.CASCADE, blank=True, null=True)
    stock = models.ForeignKey(Stock, related_name='purchase_entries', on_delete=models.CASCADE)
    purchased_quantity = models.IntegerField()
    remaining_quantity = models.IntegerField()
    purchase_price = models.DecimalField(max_digits=15, decimal_places=2)
    cogs = models.DecimalField(max_digits=15, decimal_places=2)

    def __str__(self):
        return str(self.id)