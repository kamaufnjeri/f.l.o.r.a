from django.urls import path
from journals.views import AuditTrailAPIView, DownloadAuditTrailAPIView
from django.urls import path


urlpatterns = [
    path('', AuditTrailAPIView.as_view()),
    path('download/', DownloadAuditTrailAPIView.as_view()),
]