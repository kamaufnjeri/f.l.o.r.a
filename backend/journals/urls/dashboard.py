from django.urls import path
from journals.views import DashboardAPIView
from django.urls import path


urlpatterns = [
    path('', DashboardAPIView.as_view()),
]