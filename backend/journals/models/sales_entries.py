from .base_model import BaseModel
from django.db import models
from .sales import Sales
from .stock import Stock


class SalesEntries(BaseModel):
    sales = models.ForeignKey(Sales, related_name='sales_entries', on_delete=models.CASCADE)
    stock = models.ForeignKey(Stock, related_name='sales_entries', on_delete=models.CASCADE)
    initial_quantity = models.IntegerField()
    sold_quantity = models.IntegerField()
    sales_price = models.DecimalField(max_digits=15, decimal_places=2)
    cogs = models.DecimalField(max_digits=15, decimal_places=2, default=0)

    def __str__(self):
        return self.stock.name