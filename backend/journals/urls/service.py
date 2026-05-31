from django.urls import path
from journals.views import ServiceAPIView, DownloadServiceAPIView, DownloadServiceDetailAPIView, ServiceDetailAPIView
from django.urls import path


urlpatterns = [
    path('', ServiceAPIView.as_view()),
    path('download/', DownloadServiceAPIView.as_view()),
    path('<pk>/', ServiceDetailAPIView.as_view()),
    path('<pk>/download/', DownloadServiceDetailAPIView.as_view()),
   
]