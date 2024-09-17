from django.urls import path
from journals.views import PurchaseAPIView
from django.urls import path


urlpatterns = [
    path('', PurchaseAPIView.as_view()),
]