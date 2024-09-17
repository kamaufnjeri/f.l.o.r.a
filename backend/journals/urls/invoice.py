from django.urls import path
from journals.views import SalesInvoiceAPIView, JournalInvoiceAPIView
from django.urls import path


urlpatterns = [
    path('journals/', JournalInvoiceAPIView.as_view()),
    path('sales/', SalesInvoiceAPIView.as_view())
]