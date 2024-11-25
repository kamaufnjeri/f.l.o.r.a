from .base_model import BaseModel
from django.db import models

class Stock(BaseModel):
    name = models.CharField(max_length=200)
    unit_name = models.CharField(max_length=200)
    unit_alias = models.CharField(max_length=200)
    opening_stock_quantity = models.IntegerField(blank=True, default=0)
    opening_stock_rate = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    organisation = models.ForeignKey('Organisation', related_name='stocks', on_delete=models.CASCADE)
    user = models.ForeignKey('FloraUser', related_name='stocks', on_delete=models.SET_NULL, null=True)


    def __str__(self):
        return self.name