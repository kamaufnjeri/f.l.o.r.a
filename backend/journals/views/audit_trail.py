from rest_framework import generics, status, serializers
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated

from journals.models import AuditTrail
from journals.serializers import AuditTrailSerializer
from journals.permissions import IsAdmin
from journals.utils import flatten_errors


class AuditTrailPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100



class AuditTrailAPIView(generics.ListAPIView):

    serializer_class = AuditTrailSerializer
    pagination_class = AuditTrailPagination
    permission_classes = [
        IsAuthenticated,
        IsAdmin
    ]

    def get_queryset(self):
        organisation_id = self.kwargs.get("organisation_id")

        return AuditTrail.objects.filter(
            organisation_id=organisation_id
        ).order_by("-created_at")


    def get(self, request, *args, **kwargs):

        try:

            queryset = self.get_queryset()

            paginate = request.query_params.get("paginate")


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

            return Response(
                {
                    "error": "Internal server error",
                    "details": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
