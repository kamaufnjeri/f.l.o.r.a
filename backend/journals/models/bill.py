from .base_model import BaseModel
from django.db import models
from .supplier import Supplier
from .journal import Journal
from .purchase import Purchase
from journals.constants import STATUS


class Bill(BaseModel):
    purchase = models.OneToOneField(Purchase, related_name='bill', blank=True, null=True, on_delete=models.CASCADE)
    status = models.CharField(max_length=200, choices=STATUS)
    due_date = models.DateField()
    total_amount = models.DecimalField(max_digits=15, decimal_places=2)
    amount_due = models.DecimalField(max_digits=15, decimal_places=2)
    amount_paid = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    supplier = models.ForeignKey(Supplier, related_name='bills', on_delete=models.CASCADE)
    
    def __str__(self):
        return self.supplier.name