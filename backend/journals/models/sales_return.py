from .base_model import BaseModel
from django.db import models
from .account import Account
from .sales import Sales

class SalesReturn(BaseModel):
    date = models.DateField()
    description = models.TextField()
    sales = models.ForeignKey(Sales, related_name='sales_return', on_delete=models.CASCADE)


    def __str__(self):
        return self.description