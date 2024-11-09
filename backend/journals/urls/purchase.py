from django.urls import path
from journals.views import PurchaseAPIView, PurchaseDetailAPIView, PurchasePurchaseReturnsApiView, DownloadPurchaseAPIView
from django.urls import path


urlpatterns = [
    path('', PurchaseAPIView.as_view()),
    path('download/', DownloadPurchaseAPIView.as_view()),
    path('<pk>/', PurchaseDetailAPIView.as_view()),
    path('<pk>/purchase_returns/', PurchasePurchaseReturnsApiView.as_view())
]