from rest_framework import generics, status, serializers
from rest_framework.response import Response
from journals.utils import flatten_errors, date_filtering, sort_filtering
from journals.models import Payment
from journals.serializers import PaymentSerializer
from django.db import models
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.pagination import PageNumberPagination
from journals.permissions import IsUserInOrganisation
from rest_framework.permissions import IsAuthenticated
from journals.utils.generate_pdfs import GenerateListsPDF
from django.http import HttpResponse
from .journal import get_totals

class PaymentPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class PaymentFilter(DjangoFilterBackend, SearchFilter):
    class Meta:
        model = Payment

    def filter_queryset(self, request, queryset, view):
        try:
            date = request.query_params.get('date')
            sort_by = request.query_params.get('sort_by')
            type = request.query_params.get('type')
            search = request.query_params.get('search')

            if date:
                queryset = date_filtering(queryset, date)
            
            if type:
                if type == "bills":
                    queryset = queryset.filter(bill__isnull=False)
                elif type == "invoices":
                    queryset = queryset.filter(invoice__isnull=False)
                elif type == "all":
                    queryset = queryset
                else:
                    raise ValueError("Invalid options: Expected options 'bills', 'invoices' or 'all'")

            if search:
                queryset = queryset.filter(models.Q(
                    description__icontains=search
                ) | models.Q(
                    bill__serial_number__icontains=search
                ) | models.Q(
                    invoice__serial_number__icontains=search
                ))
        

            if sort_by:
                queryset = sort_filtering(queryset, sort_by)
                
            return queryset

        except Exception as e:
            raise Exception(str(e))
        
class PaymentAPIView(generics.ListCreateAPIView):
    queryset = Payment.objects.all().order_by('created_at')
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated, IsUserInOrganisation]
    pagination_class = PaymentPagination
    filter_backends = [PaymentFilter]
    search_fields = ['description']

    def get(self, request, *args, **kwargs):
        try:
            queryset = self.filter_queryset(self.get_queryset().filter(organisation=request.user.current_org))
            paginate = request.query_params.get('paginate')

            if paginate:
                paginator = self.pagination_class()
                paginated_queryset = paginator.paginate_queryset(queryset, request)
                
                if paginated_queryset is not None:

                    serialized_data = self.get_serializer(paginated_queryset, many=True)
                    debit_total, credit_total = get_totals(serialized_data.data)

                    data = {
                    "payments": serialized_data.data,
                        "totals": {
                            "debit_total": debit_total,
                            "credit_total": credit_total
                        }
                    }
                    return paginator.get_paginated_response({
                    "status": "success",
                    "message": "Payments retrieved successfully with pagination",
                    "data": data
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
        try:
            serializer_data = request.data.copy()
            serializer_data['organisation'] = kwargs.get('organisation_id')
            serializer_data['user'] = request.user.id
            serializer = self.serializer_class(data=serializer_data)
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
        

class DownloadPaymentAPIView(generics.ListCreateAPIView):
    queryset = Payment.objects.all().order_by('created_at')
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated, IsUserInOrganisation]
    pagination_class = PaymentPagination
    filter_backends = [PaymentFilter]
    search_fields = ['description']

    def post(self, request, *args, **kwargs):
        try:
            queryset = self.filter_queryset(self.get_queryset().filter(organisation=request.user.current_org))

            filter_data = request.query_params.dict()
            title = request.data.get('title')
          
            serializer = self.get_serializer(queryset, many=True)

            debit_total, credit_total = get_totals(serializer.data)

            data = {
                "payments": serializer.data,
                "totals": {
                    "debit_total": debit_total,
                    "credit_total": credit_total
                }
            }

            pdf_generator = GenerateListsPDF(title, request.user, data, filter_data, filename='payments.html')
            buffer = pdf_generator.create_pdf()

            response = HttpResponse(buffer, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="{title}.pdf"'

            return response
        
        except serializers.ValidationError as e:
            errors = flatten_errors(e.detail)
            return Response({
                'error': 'Bad Request',
                'details': errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            raise e
            return Response({
                'error': 'Internal Server Error',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
   