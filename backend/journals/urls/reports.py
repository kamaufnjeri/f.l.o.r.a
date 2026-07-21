from django.urls import path
from journals.views import TrialBalanceAPIView, DownloadTrialBalanceAPIView
from django.urls import path


urlpatterns = [
    path('trial-balance/', TrialBalanceAPIView.as_view(), name="Trial Balance"),
    path('trial-balance/download/', DownloadTrialBalanceAPIView.as_view(), name="Trial Balance"),

]