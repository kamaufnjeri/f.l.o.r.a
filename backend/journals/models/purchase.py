from .base_model import BaseModel
from django.db import models


class Purchase(BaseModel):
    date = models.DateField()
    description = models.TextField()
    serial_number = models.CharField(max_length=200)
    organisation = models.ForeignKey('Organisation', related_name='purchases', on_delete=models.CASCADE)
    user = models.ForeignKey('FloraUser', related_name='purchases', on_delete=models.CASCADE)
    returns_total = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)


    def __str__(self):
        return self.serial_number