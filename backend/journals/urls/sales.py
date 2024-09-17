from django.urls import path
from journals.views import SalesAPIView
from django.urls import path


urlpatterns = [
    path('', SalesAPIView.as_view())
]