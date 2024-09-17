from .base_model import BaseModel
from django.db import models
from .purchase_entries import PurchaseEntries
from .sales_entries import SalesEntries


class SalesPurchasePrice(BaseModel):
    purchase_price = models.DecimalField(max_digits=15, decimal_places=2)
    sales_price =models.DecimalField(max_digits=15, decimal_places=2)
    initial_quantity = models.IntegerField()
    sold_quantity = models.IntegerField()
    purchase_entry = models.ForeignKey(PurchaseEntries, related_name='sales_purchases_price', on_delete=models.CASCADE)
    sales_entry = models.ForeignKey(SalesEntries, related_name="sales_purchase_price", on_delete=models.CASCADE)
  