from django.urls import path
from journals.views import ServiceAPIView, ServiceIncomeAPIView, ServiceIncomeDetailAPIView, DownloadServiceAPIView, DownloadServiceIncomeAPIView
from django.urls import path


urlpatterns = [
    path('', ServiceAPIView.as_view()),
    path('download/', DownloadServiceAPIView.as_view()),
    path('service_income/', ServiceIncomeAPIView.as_view()),
    path('service_income/download/', DownloadServiceIncomeAPIView.as_view()),
    path('service_income/<pk>/', ServiceIncomeDetailAPIView.as_view())
]