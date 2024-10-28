from django.urls import path
from journals.views import SelectOptionsAPIView
from django.urls import path


urlpatterns = [
    path('', SelectOptionsAPIView.as_view()),
   
]