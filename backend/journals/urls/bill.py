from django.urls import path
from journals.views import PurchaseBillAPIView, JournalBillAPIView, BillApiView, BillPaymentsApiView
from django.urls import path


urlpatterns = [
    path('', BillApiView.as_view()),
    path('<pk>/payments/', BillPaymentsApiView.as_view()),
    path('purchases/', PurchaseBillAPIView.as_view()),
    path('journals/', JournalBillAPIView.as_view()),
]