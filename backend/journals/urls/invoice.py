from django.urls import path
from journals.views import InvoiceApiView, InvoicePaymentsApiView, DownloadInvoiceApiView, DownloadInvoicePaymentsApiView
from django.urls import path


urlpatterns = [
    path('', InvoiceApiView.as_view()),
    path('download/', DownloadInvoiceApiView.as_view()),
    path('<pk>/payments/', InvoicePaymentsApiView.as_view()),
    path('<pk>/payments/download/', DownloadInvoicePaymentsApiView.as_view())
]