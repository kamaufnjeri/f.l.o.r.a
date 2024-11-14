from django.urls import path
from journals.views import StockAPIView, StockDetailAPIView, DownloadStockAPIView, DownloadStockDetailAPIView
from django.urls import path


urlpatterns = [
    path('', StockAPIView.as_view()),
    path('download/', DownloadStockAPIView.as_view()),
    path('<pk>/', StockDetailAPIView.as_view()),
    path('<pk>/download/', DownloadStockDetailAPIView.as_view())
]