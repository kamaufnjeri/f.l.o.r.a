# pdfapp/urls.py

from django.urls import path
from journals.views import GeneratePDFAPIView

urlpatterns = [
    path('generate-pdf/', GeneratePDFAPIView.as_view(), name='generate-pdf'),
]
