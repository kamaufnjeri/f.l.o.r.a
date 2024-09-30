from django.urls import path
from journals.views import SalesAPIView, SalesDetailAPIView
from django.urls import path


urlpatterns = [
    path('', SalesAPIView.as_view()),
    path('<pk>/', SalesDetailAPIView.as_view())

]