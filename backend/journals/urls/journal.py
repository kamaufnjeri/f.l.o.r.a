from django.urls import path
from journals.views import JournalAPIView
from django.urls import path


urlpatterns = [
    path('', JournalAPIView.as_view()),
]