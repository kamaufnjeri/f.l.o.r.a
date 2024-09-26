from django.urls import path
from journals.views import StockAPIView, StockDetailAPIView
from django.urls import path


urlpatterns = [
    path('', StockAPIView.as_view()),
    path('<pk>/', StockDetailAPIView.as_view())
]