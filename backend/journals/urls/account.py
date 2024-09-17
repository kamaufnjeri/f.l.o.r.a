from django.urls import path
from journals.views import AccountAPIView, AccountDetailAPIView
from django.urls import path


urlpatterns = [
    path('', AccountAPIView.as_view(), name="Accounts"),
    path('<pk>/', AccountDetailAPIView.as_view(), name="Accounts")
]