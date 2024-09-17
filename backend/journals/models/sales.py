from .base_model import BaseModel
from django.db import models


class Sales(BaseModel):
    date = models.DateField()
    description = models.TextField()

    def __str__(self):
        return self.description