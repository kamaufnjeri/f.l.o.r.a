from .base_model import BaseModel
from django.db import models


class Purchase(BaseModel):
    date = models.DateField()
    description = models.TextField()

    def __str__(self):
        return self.description