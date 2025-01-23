from .base_model import BaseModel
from django.db import models
from .account import Account
from .sales import Sales

class SalesReturn(BaseModel):
    date = models.DateField()
    description = models.TextField()
    sales = models.ForeignKey(Sales, related_name='sales_returns', on_delete=models.CASCADE)
    organisation = models.ForeignKey('Organisation', related_name='sales_returns', on_delete=models.CASCADE)
    user = models.ForeignKey('FloraUser', related_name='sales_returns', on_delete=models.SET_NULL, null=True)
    invoice_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0, blank=True, null=True)
    return_total = models.DecimalField(max_digits=15, default=0.00, decimal_places=2)


    def __str__(self):
        return self.description