from django.urls import path
from journals.views import SalesReturnAPIView, DownloadSalesReturnAPIView, SalesReturnDetailApiView
from django.urls import path


urlpatterns = [
    path('', SalesReturnAPIView.as_view()),
    path('download/', DownloadSalesReturnAPIView.as_view()),
    path('<pk>/', SalesReturnDetailApiView.as_view())
]