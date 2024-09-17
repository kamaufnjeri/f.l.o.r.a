from django.urls import path
from journals.views import CustomerAPIVew, CustomerDetailsAPIView
from django.urls import path


urlpatterns = [
    path('', CustomerAPIVew.as_view()),
    path('<pk>/', CustomerDetailsAPIView.as_view())
]