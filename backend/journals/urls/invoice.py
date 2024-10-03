from django.urls import path
from journals.views import SalesInvoiceAPIView, JournalInvoiceAPIView, InvoiceApiView
from django.urls import path


urlpatterns = [
    path('', InvoiceApiView.as_view()),
    path('journals/', JournalInvoiceAPIView.as_view()),
    path('sales/', SalesInvoiceAPIView.as_view())
]