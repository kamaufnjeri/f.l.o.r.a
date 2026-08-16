from django.http import HttpResponse

from rest_framework import generics, status, serializers
from rest_framework.filters import SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from journals.models import Account, Stock
from journals.permissions import OrganisationRolePermission
from journals.utils import flatten_errors
from journals.utils.generate_pdfs import GenerateListsPDF
from journals.utils.balance_sheet_utils import BalanceSheetUtils


class DownloadBalanceSheetAPIView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, OrganisationRolePermission]

    queryset = Account.objects.all()

    filter_backends = [DjangoFilterBackend, SearchFilter]
    search_fields = ["name"]
    filterset_fields = ["name"]

    def post(self, request, *args, **kwargs):
        try:
            organisation = request.user.current_org

            accounts = self.filter_queryset(
                self.get_queryset()
                .filter(organisation=organisation)
                .select_related(
                    "belongs_to",
                    "belongs_to__category",
                    "belongs_to__category__group",
                )
            )

            stocks = Stock.objects.filter(
                organisation=organisation
            )

            as_at_date = request.query_params.get("as_at_date")
            filter_data = request.query_params.dict()

            title = request.data.get(
                "title",
                "Balance Sheet",
            )

            data = BalanceSheetUtils(
                stocks=stocks,
                accounts=accounts,
                as_at_date=as_at_date,
            ).get_balance_sheet()

            pdf_generator = GenerateListsPDF(
                title=title,
                user=request.user,
                data=data,
                filters=filter_data,
                filename="balance_sheet.html",
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
            raise e
            return Response(
                {
                    "error": "Internal Server Error",
                    "details": str(e),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class BalanceSheetAPIView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, OrganisationRolePermission]

    queryset = Account.objects.all()

    filter_backends = [DjangoFilterBackend, SearchFilter]
    search_fields = ["name"]
    filterset_fields = ["name"]

    def get(self, request, *args, **kwargs):
        try:
            organisation = request.user.current_org

            accounts = self.filter_queryset(
                self.get_queryset()
                .filter(organisation=organisation)
                .select_related(
                    "belongs_to",
                    "belongs_to__category",
                    "belongs_to__category__group",
                )
            )

            stocks = Stock.objects.filter(
                organisation=organisation
            )

            as_at_date = request.query_params.get("as_at_date")

            data = BalanceSheetUtils(
                stocks=stocks,
                accounts=accounts,
                as_at_date=as_at_date,
            ).get_balance_sheet()

            return Response(
                data,
                status=status.HTTP_200_OK,
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