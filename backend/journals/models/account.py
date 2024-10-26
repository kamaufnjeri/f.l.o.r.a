from .base_model import BaseModel
from django.db import models
from journals.constants import GROUPS, CATEGORIES, SUB_CATEGORIES

# Create your models here.
class Account(BaseModel):
    OPENING_BALANCE = (
        ("debit", "Debit"),
        ("credit", "Credit")
    )
    name = models.CharField(max_length=200)
    group = models.CharField(max_length=200, choices=GROUPS)
    category = models.CharField(max_length=200, choices=CATEGORIES)
    sub_category = models.CharField(max_length=200, choices=SUB_CATEGORIES)
    opening_balance = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    opening_balance_type = models.CharField(max_length=200, blank=True, null=True, choices=OPENING_BALANCE)
    organisation = models.ForeignKey('Organisation', related_name='accounts', on_delete=models.CASCADE)
    user = models.ForeignKey('FloraUser', related_name='accounts', on_delete=models.CASCADE)

    def __str__(self):
        return self.name
