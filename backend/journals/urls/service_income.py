from django.urls import path
from journals.views import ServiceIncomeAPIView, ServiceIncomeDetailAPIView, DownloadServiceIncomeAPIView
from django.urls import path


urlpatterns = [
    path('', ServiceIncomeAPIView.as_view()),
    path('download/', DownloadServiceIncomeAPIView.as_view()),
    path('<pk>/', ServiceIncomeDetailAPIView.as_view())
]