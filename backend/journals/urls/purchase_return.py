from django.urls import path
from journals.views import PurchaseReturnAPIView, DownloadPurchaseReturnAPIView
from django.urls import path


urlpatterns = [
    path('', PurchaseReturnAPIView.as_view()),
    path('download/', DownloadPurchaseReturnAPIView.as_view())
]