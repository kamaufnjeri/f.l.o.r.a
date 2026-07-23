from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from journals.permissions import OrganisationRolePermission
from journals.utils.dashboard_utils import DashboardUtils


class DashboardAPIView(APIView):

    permission_classes = [
        IsAuthenticated,
        OrganisationRolePermission
    ]


    def get(self, request, *args, **kwargs):

        try:

            organisation = request.user.current_org


            period = request.query_params.get(
                "date"
            )


            accounts = organisation.accounts.all()

            stocks = organisation.stocks.all()


            dashboard = DashboardUtils(
                organisation=organisation,
                accounts=accounts,
                stocks=stocks,
                period=period,
            ).get_dashboard()


            return Response(
                dashboard,
                status=status.HTTP_200_OK
            )


        except Exception as e:
            raise e
            return Response(
                {
                    "error": "Internal Server Error",
                    "details": str(e),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )