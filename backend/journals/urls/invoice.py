from django.urls import path
from journals.views import SalesInvoiceAPIView, InvoiceApiView, InvoicePaymentsApiView, ServiceIncomeInvoiceAPIView, DownloadInvoiceApiView, DownloadInvoicePaymentsApiView
from django.urls import path


urlpatterns = [
    path('', InvoiceApiView.as_view()),
    path('download/', DownloadInvoiceApiView.as_view()),
    path('<pk>/payments/', InvoicePaymentsApiView.as_view()),
    path('<pk>/payments/download/', DownloadInvoicePaymentsApiView.as_view()),
    path('sales/', SalesInvoiceAPIView.as_view()),
    path('service_income/', ServiceIncomeInvoiceAPIView.as_view())
]