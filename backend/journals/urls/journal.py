from django.urls import path
from journals.views import JournalAPIView, JournalDetailAPIView, DownloadJournalAPIView


urlpatterns = [
    path('', JournalAPIView.as_view()),
    path('download/', DownloadJournalAPIView.as_view()),
    path('<pk>/', JournalDetailAPIView.as_view())
]