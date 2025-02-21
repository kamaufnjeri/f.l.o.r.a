from .base_model import BaseModel
from django.db import models
from .customer import Customer
from .journal import Journal
from .sales import Sales
from .service import ServiceIncome
from journals.constants import STATUS


class Invoice(BaseModel):
    sales = models.OneToOneField(Sales, related_name='invoice', blank=True, null=True, on_delete=models.CASCADE, default=None)
    service_income = models.OneToOneField(ServiceIncome, related_name='invoice', blank=True, null=True, on_delete=models.CASCADE)
    status = models.CharField(max_length=200, choices=STATUS)
    due_date = models.DateField()
    total_amount = models.DecimalField(max_digits=15, decimal_places=2)
    amount_due = models.DecimalField(max_digits=15, decimal_places=2)
    amount_paid = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    customer = models.ForeignKey(Customer, related_name='invoices', on_delete=models.CASCADE)
    

    def __str__(self):
        return self.customer.name