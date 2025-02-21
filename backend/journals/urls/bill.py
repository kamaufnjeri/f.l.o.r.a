from django.urls import path
from journals.views import BillApiView, BillPaymentsApiView, DownloadBillPaymentsApiView, DownloadBillApiView
from django.urls import path


urlpatterns = [
    path('', BillApiView.as_view()),
    path('download/', DownloadBillApiView.as_view()),
    path('<pk>/payments/', BillPaymentsApiView.as_view()),
    path('<pk>/payments/download/', DownloadBillPaymentsApiView.as_view())
]