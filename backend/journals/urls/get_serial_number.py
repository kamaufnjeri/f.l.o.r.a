from django.urls import path
from journals.views import GetSerialNumberApiView
from django.urls import path


urlpatterns = [
    path('', GetSerialNumberApiView.as_view()),
   
]