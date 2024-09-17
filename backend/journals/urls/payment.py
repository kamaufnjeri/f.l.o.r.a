from django.urls import path
from journals.views import PaymentAPIView
from django.urls import path


urlpatterns = [
    path('', PaymentAPIView.as_view())
]