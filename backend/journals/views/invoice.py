from rest_framework import generics, status, serializers
from rest_framework.response import Response
from journals.utils import flatten_errors, due_days_filtering, status_filtering
from django.db import models
from journals.models import Journal, Sales, Invoice, Payment, ServiceIncome
from journals.serializers import SalesInvoiceSerializer, InvoiceDetailSerializer, PaymentSerializer, ServiceIncomeInvoiceSerializer
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.pagination import PageNumberPagination
from journals.permissions import IsUserInOrganisation
from rest_framework.permissions import IsAuthenticated
from journals.utils.generate_pdfs import GenerateListsPDF
from django.http import HttpResponse
from .journal import get_totals


class InvoicePagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class InvoiceFilter(DjangoFilterBackend, SearchFilter):
    class Meta:
        model = Invoice

    def filter_queryset(self, request, queryset, view):
        search = request.query_params.get("search")
        due_days = request.query_params.get("due_days")

        status = request.query_params.get("status")

        if search:
            queryset = queryset.filter(models.Q(
                serial_number__icontains=search
            ) | models.Q(customer__name__icontains=search))

        if status:
            queryset = status_filtering(queryset, status)

        if due_days:
            queryset = due_days_filtering(queryset, due_days)
            
        return queryset
        
class InvoiceApiView(generics.ListAPIView):
    queryset = Invoice.objects.all().order_by('created_at')
    serializer_class = InvoiceDetailSerializer
    permission_classes = [IsAuthenticated, IsUserInOrganisation]
    pagination_class = InvoicePagination
    filter_backends = [InvoiceFilter]
    search_fields = ['serial_number', 'customer']

    def get(self, request, *args, **kwargs):
        try:
            queryset = self.filter_queryset(self.get_queryset().filter(organisation=request.user.current_org))
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
            raise e
            return Response({
                'error': 'Internal server error',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DownloadInvoiceApiView(generics.ListAPIView):
    queryset = Invoice.objects.all().order_by('created_at')
    serializer_class = InvoiceDetailSerializer
    permission_classes = [IsAuthenticated, IsUserInOrganisation]
    pagination_class = InvoicePagination
    filter_backends = [InvoiceFilter]
    search_fields = ['serial_number', 'customer']


    def post(self, request, *args, **kwargs):
        try:
            queryset = self.filter_queryset(self.get_queryset().filter(organisation=request.user.current_org))

            filter_data = request.query_params.dict()
            title = request.data.get('title')
          
            serializer = self.get_serializer(queryset, many=True)

            pdf_generator = GenerateListsPDF(title, request.user, serializer.data, filter_data, filename='invoices.html')
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


class SalesInvoiceAPIView(generics.CreateAPIView):
    queryset = Sales.objects.filter(invoice__isnull=False)
    serializer_class = SalesInvoiceSerializer
    permission_classes = [IsAuthenticated, IsUserInOrganisation]


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


class ServiceIncomeInvoiceAPIView(generics.CreateAPIView):
    queryset = ServiceIncome.objects.filter(invoice__isnull=False)
    serializer_class = ServiceIncomeInvoiceSerializer
    permission_classes = [IsAuthenticated, IsUserInOrganisation]


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
      

class InvoicePaymentsApiView(generics.ListAPIView):
    serializer_class = PaymentSerializer
    queryset = Payment.objects.all()
    pagination_class = InvoicePagination
    permission_classes = [IsAuthenticated, IsUserInOrganisation]

    def get(self, request, *args, **kwargs):
        try:
            pk = kwargs.get('pk')
            queryset = self.get_queryset()
            queryset = queryset.filter(invoice_id=pk).order_by('-date')

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


class DownloadInvoicePaymentsApiView(generics.ListAPIView):
    serializer_class = PaymentSerializer
    queryset = Payment.objects.all()
    pagination_class = InvoicePagination
    permission_classes = [IsAuthenticated, IsUserInOrganisation]

    def post(self, request, *args, **kwargs):
        try:
            pk = kwargs.get('pk')
            queryset = self.get_queryset()
            data = queryset.filter(invoice_id=pk).order_by('-date')
           
            title = request.data.get('title')
          
            serializer = self.get_serializer(data, many=True)
            
            debit_total, credit_total = get_totals(serializer.data)
            data = {
                        "payments": serializer.data,
                        "totals": {
                            "debit_total": debit_total,
                            "credit_total": credit_total
                        }
                    }


            pdf_generator = GenerateListsPDF(title, request.user, data, None, filename='payments.html')
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