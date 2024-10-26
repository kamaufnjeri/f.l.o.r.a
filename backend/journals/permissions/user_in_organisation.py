from rest_framework.permissions import BasePermission
from journals.models import Organisation, OrganisationMembership


class IsUserInOrganisation(BasePermission):
    def has_permission(self, request, view):
        organisation_id = view.kwargs.get('organisation_id')
        if organisation_id:
            try:
                organisation = Organisation.objects.get(id=organisation_id)

                if request.user.current_org == organisation:

                    membership = OrganisationMembership.objects.filter(
                        organisation=organisation,
                        user=request.user,
                        is_active=True
                    ).exists()

                return membership

            except Organisation.DoesNotExist:
                return False
        return False