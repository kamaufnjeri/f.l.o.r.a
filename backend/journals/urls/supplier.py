from django.urls import path
from journals.views import SupplierAPIVew, SupplierDetailsAPIView
from django.urls import path


urlpatterns = [
    path('', SupplierAPIVew.as_view()),
    path('<pk>/', SupplierDetailsAPIView.as_view())
]