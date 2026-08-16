from django.http import HttpResponse
from rest_framework import generics, status, serializers
from rest_framework.filters import SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from journals.models import Account
from journals.permissions import OrganisationRolePermission
from journals.utils import flatten_errors
from journals.utils.generate_pdfs import GenerateListsPDF
from journals.utils.trial_balance_utils import TrialBalanceUtils


class DownloadTrialBalanceAPIView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, OrganisationRolePermission]
    queryset = Account.objects.all()
    filter_backends = [DjangoFilterBackend, SearchFilter]
    search_fields = ["name"]
    filterset_fields = ["name"]

    def post(self, request, *args, **kwargs):
        try:
            organisation = request.user.current_org

            queryset = self.filter_queryset(
                self.get_queryset()
                .filter(organisation=organisation)
                .select_related(
                    "belongs_to",
                    "belongs_to__category",
                    "belongs_to__category__group",
                )
            )

            as_at_date = request.query_params.get("as_at_date")
            filter_data = request.query_params.dict()

            title = request.data.get("title", "Trial Balance")

            data = TrialBalanceUtils(
                queryset=queryset,
                as_at_date=as_at_date,
            ).get_trial_balance()

            pdf_generator = GenerateListsPDF(
                title=title,
                user=request.user,
                data=data,
                filters=filter_data,
                filename="trial_balance.html",
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


class TrialBalanceAPIView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, OrganisationRolePermission]
    queryset = Account.objects.all()
    filter_backends = [DjangoFilterBackend, SearchFilter]
    search_fields = ["name"]
    filterset_fields = ["name"]

    def get(self, request, *args, **kwargs):
        try:
            organisation = request.user.current_org

            queryset = self.filter_queryset(
                self.get_queryset().filter(
                    organisation=organisation
                ).select_related(
                    "belongs_to",
                    "belongs_to__category",
                    "belongs_to__category__group",
                )
            )

            as_at_date = request.query_params.get("as_at_date")
          

            trial_balance = TrialBalanceUtils(
                queryset=queryset,
                as_at_date=as_at_date,
            )

            data = trial_balance.get_trial_balance()

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