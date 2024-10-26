from .base_model import BaseModel
from django.db import models
from .bill import Bill
from .invoice import Invoice


class Payment(BaseModel):
    invoice = models.ForeignKey(Invoice, related_name="payment", null=True, blank=True, on_delete=models.CASCADE)
    bill = models.ForeignKey(Bill, related_name="payment", null=True, blank=True, on_delete=models.CASCADE)
    date = models.DateField()
    description = models.TextField()
    amount_paid = models.DecimalField(max_digits=15, decimal_places=2)
    organisation = models.ForeignKey('Organisation', related_name='payments', on_delete=models.CASCADE)
    user = models.ForeignKey('FloraUser', related_name='payments', on_delete=models.CASCADE)
