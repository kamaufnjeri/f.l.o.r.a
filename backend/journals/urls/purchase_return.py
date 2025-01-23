from django.urls import path
from journals.views import PurchaseReturnAPIView, DownloadPurchaseReturnAPIView, PurchaseReturnDetailApiView
from django.urls import path


urlpatterns = [
    path('', PurchaseReturnAPIView.as_view()),
    path('download/', DownloadPurchaseReturnAPIView.as_view()),
    path('<pk>/', PurchaseReturnDetailApiView.as_view())
]