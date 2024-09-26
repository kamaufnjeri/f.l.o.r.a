from django.urls import path
from journals.views import PurchaseAPIView, PurchaseDetailAPIView
from django.urls import path


urlpatterns = [
    path('', PurchaseAPIView.as_view()),
    path('<pk>/', PurchaseDetailAPIView.as_view())
]