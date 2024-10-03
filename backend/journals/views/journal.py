from rest_framework import generics, status, serializers
from rest_framework.response import Response
from journals.utils import flatten_errors
from journals.models import Journal
from journals.serializers import JournalSerializer, JournalDetailSerializer
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.pagination import PageNumberPagination
from django.db import models
from datetime import datetime
from journals.utils import date_filtering, sort_filtering


class JournalPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class JournalFilter(DjangoFilterBackend):
    class Meta:
        model = Journal

    def filter_queryset(self, request, queryset, view):
        try:
            journals = request.query_params.get('journals')
            date = request.query_params.get('date')
            sort_by = request.query_params.get('sort_by')

            if date:
                queryset = date_filtering(queryset, date)
        
            if journals:
                if journals == "is_invoices":
                    queryset = queryset.filter(invoice__isnull=False)
                elif journals == "is_bills":
                    queryset = queryset.filter(bill__isnull=False)
                elif journals == "is_bills_or_invoices":
                    queryset = queryset.filter(models.Q(invoice__isnull=False) | models.Q(bill__isnull=False))
                elif journals == "is_not_bills_or_invoices":
                    queryset = queryset.filter(models.Q(invoice__isnull=True) & models.Q(bill__isnull=True))
                elif journals == "all":
                    queryset = queryset
                else:
                    raise Exception("Valid options for journals are 'is_invoices', 'is_bills', 'is_bills_or_invoices', 'is_not_bills_or_invoices', or 'all'")
            
            if sort_by:
                queryset = sort_filtering(queryset, sort_by)

            return queryset

        except Exception as e:
            raise Exception(str(e))





class JournalAPIView(generics.ListCreateAPIView):
    queryset = Journal.objects.all()
    serializer_class = JournalSerializer
    pagination_class = JournalPagination
    filter_backends = [JournalFilter, SearchFilter]
    search_fields = ['serial_number', 'description']


    def get(self, request, *args, **kwargs):
        try:
            queryset = self.filter_queryset(self.get_queryset())
            paginate = request.query_params.get('paginate')

            if paginate:
                paginator = self.pagination_class()
                paginated_queryset = paginator.paginate_queryset(queryset, request)
                if paginated_queryset is not None:
                    serialized_data = self.get_serializer(paginated_queryset, many=True)
                    return paginator.get_paginated_response({
                    "status": "success",
                    "message": "Accounts retrieved successfully with pagination",
                    "data": serialized_data.data
                }) 

            else:
                serializer = self.get_serializer(queryset, many=True)

                return Response(serializer.data, status=status.HTTP_200_OK)
        
        except serializers.ValidationError as e:
            errors = flatten_errors(e.detail)
            return Response({
                'error': 'Bad Request',
                'details': errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'error': 'Internal server error',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except serializers.ValidationError as e:
            errors = flatten_errors(e.detail)
            print(f"Validation Error: {e.detail}") 
            return Response({
                'error': 'Bad Request',
                'details': errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Internal Error: {e}") 
            return Response({
                'error': 'Internal server error',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class JournalDetailAPIView(generics.RetrieveAPIView):
    serializer_class = JournalDetailSerializer
    queryset = Journal.objects.all()