from .base_model import BaseModel
from django.db import models

class Service(BaseModel):
    name = models.CharField(max_length=200)
    description = models.TextField()
    organisation = models.ForeignKey('Organisation', related_name='services', on_delete=models.CASCADE)
    user = models.ForeignKey('FloraUser', related_name='user', on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return self.name

class ServiceIncome(BaseModel):
    date = models.DateField()
    description = models.TextField()
    serial_number = models.CharField(max_length=200)
    organisation = models.ForeignKey('Organisation', related_name='service_incomes', on_delete=models.CASCADE)
    user = models.ForeignKey('FloraUser', related_name='service_incomes', on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return self.serial_number


class ServiceIncomeEntry(BaseModel):
    service_income = models.ForeignKey(ServiceIncome, related_name='service_income_entries', on_delete=models.CASCADE)
    service = models.ForeignKey(Service, related_name='service_income_entries', on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    price = models.DecimalField(max_digits=15, decimal_places=2)
    service_income_total = models.DecimalField(max_digits=15, decimal_places=2)


    def __str__(self):
        return self.service.name