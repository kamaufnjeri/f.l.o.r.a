from django.urls import path
from journals.views import OrganisationApiView, OrganizationAcceptInviteApiView, OrganisationSentInviteApiView
from django.urls import path


urlpatterns = [
    path('', OrganisationApiView.as_view()),
    path('send-invite/', OrganisationSentInviteApiView.as_view()),
    path('accept-invite/<uidb64>/', OrganizationAcceptInviteApiView.as_view())
   
]