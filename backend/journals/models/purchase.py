from .base_model import BaseModel
from django.db import models


class Purchase(BaseModel):
    date = models.DateField()
    description = models.TextField()
    serial_number = models.CharField(max_length=200)

    def __str__(self):
        return self.serial_number