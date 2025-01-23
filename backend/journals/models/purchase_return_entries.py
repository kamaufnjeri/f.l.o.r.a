from .base_model import BaseModel
from .stock import Stock
from django.db import models
from .purchase_return import PurchaseReturn
from .purchase_entries import PurchaseEntries


class PurchaseReturnEntries(BaseModel):
    purchase_return = models.ForeignKey(PurchaseReturn, related_name='return_entries', on_delete=models.CASCADE)
    purchase_entry = models.ForeignKey(PurchaseEntries, related_name='return_entries', on_delete=models.CASCADE)
    stock = models.ForeignKey(Stock, related_name='purchase_return_entries', on_delete=models.CASCADE)
    return_quantity = models.IntegerField()
    purchase_price = models.DecimalField(max_digits=15, decimal_places=2)
    return_price = models.DecimalField(max_digits=15, decimal_places=2)
    cogs = models.DecimalField(max_digits=15, decimal_places=2)
