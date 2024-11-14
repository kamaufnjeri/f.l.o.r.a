from django.urls import path
from journals.views import SupplierAPIVew, SupplierDetailsAPIView, DownloadSupplierAPIVew, DownloadSupplierDetailAPIView
from django.urls import path


urlpatterns = [
    path('', SupplierAPIVew.as_view()),
    path('download/', DownloadSupplierAPIVew.as_view()),
    path('<pk>/', SupplierDetailsAPIView.as_view()),
    path('<pk>/download/', DownloadSupplierDetailAPIView.as_view())
]