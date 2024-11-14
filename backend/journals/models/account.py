from .base_model import BaseModel
from django.db import models
from journals.constants import GROUPS, CATEGORIES, SUB_CATEGORIES


class FixedGroup(models.Model):
    name = models.CharField(max_length=200)
    value = models.CharField(max_length=200)

    def __str__(self):
        return self.name


class Category(BaseModel):
    name = models.CharField(max_length=200)
    value = models.CharField(max_length=200)
    user = models.ForeignKey('FloraUser', related_name='categories', on_delete=models.CASCADE)
    organisation = models.ForeignKey('Organisation', related_name='categories', on_delete=models.CASCADE)
    group = models.ForeignKey(FixedGroup, related_name='group', on_delete=models.CASCADE)
    

    def __str__(self):
        return self.name

class SubCategory(BaseModel):
    name = models.CharField(max_length=200)
    value = models.CharField(max_length=200)
    category = models.ForeignKey(Category, related_name='category', on_delete=models.CASCADE)
    

    def __str__(self):
        return self.name

class Account(BaseModel):
    OPENING_BALANCE = (
        ("debit", "Debit"),
        ("credit", "Credit")
    )
    name = models.CharField(max_length=200)
    belongs_to = models.ForeignKey(SubCategory, related_name='accounts', on_delete=models.CASCADE, unique=False)
    opening_balance = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    opening_balance_type = models.CharField(max_length=200, blank=True, null=True, choices=OPENING_BALANCE)
    organisation = models.ForeignKey('Organisation', related_name='accounts', on_delete=models.CASCADE)
    user = models.ForeignKey('FloraUser', related_name='accounts', on_delete=models.CASCADE)

    def __str__(self):
        return self.name


