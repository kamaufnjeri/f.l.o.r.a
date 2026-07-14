from django.urls import path
from journals.views import OrganisationApiView, OrganizationAcceptInviteApiView, OrganisationSentInviteApiView, ChangeCurrentOrgApiView, OrganisationDetailsApiView, OrganisationMembershipApiView, OrganisationArchiveApiView
from django.urls import path


urlpatterns = [
    path('', OrganisationApiView.as_view()),
    path('accept-invite/<uidb64>/', OrganizationAcceptInviteApiView.as_view()),
    path('change-current-organisation/', ChangeCurrentOrgApiView.as_view()),
    path('<pk>/archive/', OrganisationArchiveApiView.as_view()),
    path('<organisation_id>/', OrganisationDetailsApiView.as_view()),
    path('<organisation_id>/membership/', OrganisationMembershipApiView.as_view()),
    path('<organisation_id>/send-invite/', OrganisationSentInviteApiView.as_view()),
]
