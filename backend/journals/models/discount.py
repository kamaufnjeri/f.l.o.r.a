from .base_model import BaseModel
from django.db import models
from .purchase import Purchase
from .sales import Sales
from .service import ServiceIncome


class Discount(BaseModel):
    DISCOUNT_TYPES = (
        ('purchase', 'Purchase'),
        ('sales', 'Sales'),
        ('service_income', 'Service Income')
    )
    discount_type = models.CharField(max_length=120, choices=DISCOUNT_TYPES)
    purchase = models.OneToOneField(Purchase, related_name='discount_received', on_delete=models.CASCADE, null=True, blank=True)
    sales = models.OneToOneField(Sales, related_name='discount_allowed', on_delete=models.CASCADE, null=True, blank=True)
    service_income = models.OneToOneField(ServiceIncome, related_name="discount_allowed", on_delete=models.CASCADE, blank=True, null=True)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=15, decimal_places=2)