from django.urls import path
from journals.views import SalesReturnAPIView
from django.urls import path


urlpatterns = [
    path('', SalesReturnAPIView.as_view())
]