from django.urls import path
from journals.views import PaymentAPIView, DownloadPaymentAPIView
from django.urls import path


urlpatterns = [
    path('', PaymentAPIView.as_view()),
    path('download/', DownloadPaymentAPIView.as_view())

]