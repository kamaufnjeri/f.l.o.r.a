from rest_framework.permissions import BasePermission, SAFE_METHODS
from rest_framework.exceptions import PermissionDenied
from journals.models import OrganisationMembership


class OrganisationPermission(BasePermission):
    allowed_roles = []

    def get_membership(self, request, view):
        organisation_id = (
            view.kwargs.get("organisation_id")
        )

        if not organisation_id:
            raise PermissionDenied("Organisation is required.")

        if not request.user.is_active:
            raise PermissionDenied("Your account is inactive.")

        if request.user.is_archived:
            raise PermissionDenied("Your account has been archived.")

        if (
            request.user.current_org
            and (
                str(request.user.current_org.id) != str(organisation_id)
                or request.user.current_org.is_archived
            )
        ):
            raise PermissionDenied("You are not using the correct organisation.")

        membership = OrganisationMembership.objects.filter(
            organisation_id=organisation_id,
            user=request.user,
            is_active=True,
        ).first()

        if not membership:
            raise PermissionDenied("You are not a member of this organisation.")

        return membership
    
    def has_permission(self, request, view):
        membership = self.get_membership(request, view)

        if not self.allowed_roles:
            return True

        if membership.role not in self.allowed_roles:
            raise PermissionDenied("You do not have permission to perform this action.")

        return True


class IsOrganisationMember(OrganisationPermission):
    pass


class IsViewer(OrganisationPermission):
    allowed_roles = ["viewer", "editor", "admin"]


class IsEditor(OrganisationPermission):
    allowed_roles = ["editor", "admin"]


class IsAdmin(OrganisationPermission):
    allowed_roles = ["admin"]

class IsSuperAdmin(OrganisationPermission):
    allowed_roles = ["super_admin"]

class OrganisationRolePermission(OrganisationPermission):
    def has_permission(self, request, view):
        membership = self.get_membership(request, view)

        if request.method in SAFE_METHODS:
            return True

        if request.method in ["POST", "PUT", "PATCH"]:
            if membership.role in ["editor", "admin"]:
                return True
            raise PermissionDenied(
                "Only editors and administrators can perform this action."
            )

        if request.method == "DELETE":
            if membership.role == "admin":
                return True
            raise PermissionDenied(
                "Only administrators can delete resources."
            )

        raise PermissionDenied(
            "You do not have permission to perform this action."
        )