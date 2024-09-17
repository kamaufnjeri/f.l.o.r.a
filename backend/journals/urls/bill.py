from django.urls import path
from journals.views import PurchaseBillAPIView, JournalBillAPIView
from django.urls import path


urlpatterns = [
    path('purchases/', PurchaseBillAPIView.as_view()),
    path('journals/', JournalBillAPIView.as_view()),
]