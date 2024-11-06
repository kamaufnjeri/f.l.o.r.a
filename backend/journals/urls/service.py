from django.urls import path
from journals.views import ServiceAPIView, ServiceIncomeAPIView, ServiceIncomeDetailAPIView
from django.urls import path


urlpatterns = [
    path('', ServiceAPIView.as_view()),
    path('service_income/', ServiceIncomeAPIView.as_view()),
    path('service_income/<pk>/', ServiceIncomeDetailAPIView.as_view())
]