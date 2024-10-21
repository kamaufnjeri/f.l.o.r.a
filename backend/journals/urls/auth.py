# urls.py

from django.urls import path
from journals.views import RegisterAPIVew, VerifyEmailView, CustomLoginAPIView, ResetPasswordAPIView, ForgotPasswordAPIView, MeAPIView, LogoutView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('login/', CustomLoginAPIView.as_view(), name='login'), 
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'), 
    path('register/', RegisterAPIVew.as_view(), name="Register"),
    path('confirm-email/<uidb64>/<token>/', VerifyEmailView.as_view(), name='confirm-email'),
    path('reset-password/<uidb64>/<token>/', ResetPasswordAPIView.as_view(), name='confirm-email'),
    path('forgot-password/', ForgotPasswordAPIView.as_view(), name='confirm-email'),
    path('me/', MeAPIView.as_view()),
    path('logout/', LogoutView.as_view())
]
