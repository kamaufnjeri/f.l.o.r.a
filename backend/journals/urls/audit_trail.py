from django.urls import path
from journals.views import AuditTrailAPIView
from django.urls import path


urlpatterns = [
    path('', AuditTrailAPIView.as_view()),
   
]