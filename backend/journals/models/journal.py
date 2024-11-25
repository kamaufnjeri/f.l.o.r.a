from .base_model import BaseModel
from django.db import models


class Journal(BaseModel):
    date = models.DateField()
    description = models.TextField()
    serial_number = models.CharField(max_length=200)
    organisation = models.ForeignKey('Organisation', related_name='journals', on_delete=models.CASCADE)
    user = models.ForeignKey('FloraUser', related_name='journals', on_delete=models.SET_NULL, null=True)


    def __str__(self):
        return self.serial_number