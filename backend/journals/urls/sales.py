from django.urls import path
from journals.views import SalesAPIView, SalesDetailAPIView, SalesSalesReturnsApiView, DownloadSalesAPIView
from django.urls import path


urlpatterns = [
    path('', SalesAPIView.as_view()),
    path('download/', DownloadSalesAPIView.as_view()),
    path('<pk>/', SalesDetailAPIView.as_view()),
    path('<pk>/sales_returns/', SalesSalesReturnsApiView.as_view())
]