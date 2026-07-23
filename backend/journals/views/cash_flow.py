from django.http import HttpResponse
from rest_framework import status, serializers
from rest_framework.views import APIView
from rest_framework.filters import SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from journals.permissions import OrganisationRolePermission
from journals.utils import flatten_errors
from journals.utils.generate_pdfs import GenerateListsPDF
from journals.utils.cash_flow_utils import CashFlowUtils


class DownloadCashFlowAPIView(APIView):
    permission_classes = [IsAuthenticated, OrganisationRolePermission]
  
    def post(self, request, *args, **kwargs):
        try:
            organisation = request.user.current_org

           
            period = request.query_params.get("date")
            filter_data = request.query_params.dict()

            title = request.data.get("title", "Cash Flow Statement")

            data = CashFlowUtils(
                organisation=organisation,
                period=period,
            ).get_cash_flow()

            pdf_generator = GenerateListsPDF(
                title=title,
                user=request.user,
                data=data,
                filters=filter_data,
                filename="cash_flow.html",
            )

            buffer = pdf_generator.create_pdf()

            response = HttpResponse(
                buffer,
                content_type="application/pdf",
            )

            response["Content-Disposition"] = (
                f'attachment; filename="{title}.pdf"'
            )

            return response

        except serializers.ValidationError as e:
            return Response(
                {
                    "error": "Bad Request",
                    "details": flatten_errors(e.detail),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:
            
            return Response(
                {
                    "error": "Internal Server Error",
                    "details": str(e),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class CashFlowAPIView(APIView):
    permission_classes = [IsAuthenticated, OrganisationRolePermission]
    filter_backends = [DjangoFilterBackend, SearchFilter]
   

    def get(self, request, *args, **kwargs):
        try:
            organisation = request.user.current_org

            

            period = request.query_params.get("date")

            cash_flow = CashFlowUtils(
                organisation=organisation,
                period=period,
            )

            data = cash_flow.get_cash_flow()

            return Response(data, status=status.HTTP_200_OK)

        except Exception as e:
            raise e
            return Response(
                {
                    "error": "Internal Server Error",
                    "details": str(e),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )