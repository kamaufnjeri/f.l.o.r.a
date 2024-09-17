from django.urls import path
from journals.views import PurchaseReturnAPIView
from django.urls import path


urlpatterns = [
    path('', PurchaseReturnAPIView.as_view())
]