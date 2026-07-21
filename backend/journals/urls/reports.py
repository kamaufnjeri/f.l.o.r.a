from django.urls import path
from journals.views import TrialBalanceAPIView, DownloadTrialBalanceAPIView, IncomeStatementAPIView, DownloadIncomeStatementAPIView
from django.urls import path


urlpatterns = [
    path('trial-balance/', TrialBalanceAPIView.as_view(), name="Trial Balance"),
    path('trial-balance/download/', DownloadTrialBalanceAPIView.as_view(), name="Trial Balance download"),
    path('income-statement/', IncomeStatementAPIView.as_view(), name="Income Stament"),
    path('income-statement/download/', DownloadIncomeStatementAPIView.as_view(), name="Income Statement download"),
]