from django.urls import path
from journals.views import JournalAPIView, JournalDetailAPIView
from django.urls import path


urlpatterns = [
    path('', JournalAPIView.as_view()),
    path('<pk>/', JournalDetailAPIView.as_view())

]