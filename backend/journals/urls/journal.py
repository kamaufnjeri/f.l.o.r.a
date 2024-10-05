from django.urls import path
from journals.views import JournalAPIView, JournalDetailAPIView


urlpatterns = [
    path('', JournalAPIView.as_view()),
    path('<pk>/', JournalDetailAPIView.as_view())
]