from django.urls import path
from journals.views import PurchaseBillAPIView, JournalBillAPIView, BillApiView
from django.urls import path


urlpatterns = [
    path('', BillApiView.as_view()),
    path('purchases/', PurchaseBillAPIView.as_view()),
    path('journals/', JournalBillAPIView.as_view()),
]