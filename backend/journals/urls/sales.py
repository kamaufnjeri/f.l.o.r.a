from django.urls import path
from journals.views import SalesAPIView, SalesDetailAPIView, SalesSalesReturnsApiView, DownloadSalesAPIView, DownloadSalesSalesReturnsApiView
from django.urls import path


urlpatterns = [
    path('', SalesAPIView.as_view()),
    path('download/', DownloadSalesAPIView.as_view()),
    path('<pk>/', SalesDetailAPIView.as_view()),
    path('<pk>/returns/', SalesSalesReturnsApiView.as_view()),
    path('<pk>/returns/download/', DownloadSalesSalesReturnsApiView.as_view())
]