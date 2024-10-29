from .base_model import BaseModel
from django.db import models
from .stock import Stock
from .sales_return import SalesReturn
from .sales_entries import SalesEntries


class SalesReturnEntries(BaseModel):
    sales_return = models.ForeignKey(SalesReturn, related_name='return_entries', on_delete=models.CASCADE)
    sales_entry = models.ForeignKey(SalesEntries, related_name='return_entries', on_delete=models.CASCADE)
    stock = models.ForeignKey(Stock, related_name='sales_return_entries', on_delete=models.CASCADE)
    return_quantity = models.IntegerField()
    sales_price = models.DecimalField(max_digits=15, decimal_places=2)
    return_price = models.DecimalField(max_digits=15, decimal_places=2)

