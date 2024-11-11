from django.urls import path
from journals.views import CustomerAPIVew, CustomerDetailsAPIView, DownloadCustomerAPIVew
from django.urls import path


urlpatterns = [
    path('', CustomerAPIVew.as_view()),
    path('download/', DownloadCustomerAPIVew.as_view()),
    path('<pk>/', CustomerDetailsAPIView.as_view())
]