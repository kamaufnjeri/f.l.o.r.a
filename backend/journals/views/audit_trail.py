from rest_framework import generics, status, serializers
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from django.http import HttpResponse
from journals.models import AuditTrail
from journals.serializers import AuditTrailSerializer
from journals.permissions import IsAdmin
from journals.utils import flatten_errors
from journals.utils import created_at_filtering
from journals.utils.generate_pdfs import GenerateListsPDF


class AuditTrailPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class AuditTrailFilter:
    class Meta:
        model = AuditTrail

    def filter_queryset(self, request, queryset, view):
        try:
            action = request.query_params.get("action")
            model_name = request.query_params.get("model_name")
            date = request.query_params.get("date")
            sort_by = request.query_params.get("sort_by")

            if action:
                queryset = queryset.filter(
                    action__iexact=action
                )

            if model_name:
                queryset = queryset.filter(
                    model_name__iexact=model_name
                )


            if date:
                queryset = created_at_filtering(queryset, date)

            if sort_by:
                if sort_by.lower() == "newest":
                    queryset = queryset.order_by("-created_at")

                elif sort_by.lower() == "oldest":
                    queryset = queryset.order_by("created_at")

            return queryset

        except Exception as e:
            raise Exception(str(e))

class AuditTrailAPIView(generics.ListAPIView):
    queryset = AuditTrail.objects.all().order_by('-created_at')
    filter_backends = [AuditTrailFilter]
    serializer_class = AuditTrailSerializer
    pagination_class = AuditTrailPagination
    permission_classes = [
        IsAuthenticated,
        IsAdmin
    ]


    def get(self, request, *args, **kwargs):

        try:
            queryset = self.filter_queryset(self.get_queryset().filter(organisation=request.user.current_org))
            paginate = request.query_params.get('paginate')

            if paginate:

                paginator = self.pagination_class()

                paginated_queryset = paginator.paginate_queryset(
                    queryset,
                    request
                )


                if paginated_queryset is not None:

                    serializer = self.get_serializer(
                        paginated_queryset,
                        many=True
                    )


                    return paginator.get_paginated_response(
                        {
                            "status": "success",
                            "message": "Audit trails retrieved successfully with pagination",
                            "data": serializer.data
                        }
                    )


            serializer = self.get_serializer(
                queryset,
                many=True
            )


            return Response(
                {
                    "status": "success",
                    "message": "Audit trails retrieved successfully",
                    "data": serializer.data
                },
                status=status.HTTP_200_OK
            )


        except serializers.ValidationError as e:

            errors = flatten_errors(e.detail)

            return Response(
                {
                    "error": "Bad Request",
                    "details": errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )


        except Exception as e:
            raise e

            return Response(
                {
                    "error": "Internal server error",
                    "details": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class DownloadAuditTrailAPIView(generics.ListCreateAPIView):

    queryset = AuditTrail.objects.all().order_by('-created_at')
    filter_backends = [AuditTrailFilter]
    serializer_class = AuditTrailSerializer
    pagination_class = AuditTrailPagination
    permission_classes = [
        IsAuthenticated,
        IsAdmin
    ]


    def post(self, request, *args, **kwargs):

        try:

            queryset = self.filter_queryset(self.get_queryset().filter(organisation=request.user.current_org))

            filter_data = request.query_params.dict()
            title = request.data.get('title')
          


           
            title = request.data.get(
                "title",
                "Audit Trail Report"
            )


            serializer = self.get_serializer(
                queryset,
                many=True
            )


            data = {
                "audit_trails": serializer.data
            }


            pdf_generator = GenerateListsPDF(
                title,
                request.user,
                data,
                filter_data,
                filename="audit_trails.html"
            )


            buffer = pdf_generator.create_pdf()


            response = HttpResponse(
                buffer,
                content_type="application/pdf"
            )


            response["Content-Disposition"] = (
                f'attachment; filename="{title}.pdf"'
            )


            return response


        except serializers.ValidationError as e:

            errors = flatten_errors(e.detail)

            return Response(
                {
                    "error": "Bad Request",
                    "details": errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )


        except Exception as e:
            raise e

            return Response(
                {
                    "error": "Internal Server Error",
                    "details": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
