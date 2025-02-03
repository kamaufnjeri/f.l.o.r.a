from rest_framework import generics, status, serializers
from rest_framework.response import Response
from journals.utils import flatten_errors, due_days_filtering, status_filtering
from django.db import models
from journals.models import Organisation, Invoice, Payment
from journals.serializers import InvoiceDetailSerializer, PaymentsDetailSerializer
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.pagination import PageNumberPagination
from journals.permissions import IsUserInOrganisation
from rest_framework.permissions import IsAuthenticated
from journals.utils.generate_pdfs import GenerateListsPDF
from django.http import HttpResponse
from django.shortcuts import get_object_or_404

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
                models.Q(
                    sales__serial_number__icontains=search) | models.Q(
                    service_income__serial_number__icontains=search
                )
            ) | models.Q(customer__name__icontains=search)).exclude(
                sales=None, service_income=None
            )

        if status:
            queryset = status_filtering(queryset, status)

        if due_days:
            queryset = due_days_filtering(queryset, due_days)
            
        return queryset

def get_invoices_totals(data):
    amount_due = sum(float(invoice.get('amount_due')) for invoice in data)
    amount_paid = sum(float(invoice.get('amount_paid')) for invoice in data)

    return {
        "invoices": data,
        "totals": {
            "amount_paid": amount_paid,
            "amount_due": amount_due
        }
    }    
class InvoiceApiView(generics.ListAPIView):
    queryset = Invoice.objects.all().order_by('created_at')
    serializer_class = InvoiceDetailSerializer
    permission_classes = [IsAuthenticated, IsUserInOrganisation]
    pagination_class = InvoicePagination
    filter_backends = [InvoiceFilter]
    search_fields = ['serial_number', 'customer']

    def get(self, request, *args, **kwargs):
        try:
            queryset = self.filter_queryset(
                self.get_queryset().filter(
                    models.Q(sales__organisation=request.user.current_org) |
                    models.Q(service_income__organisation=request.user.current_org)
                ).exclude(sales=None, service_income=None)
            )

            paginate = request.query_params.get('paginate')

            if paginate:
                paginator = self.pagination_class()
                paginated_queryset = paginator.paginate_queryset(queryset, request)
                if paginated_queryset is not None:
                    serialized_data = self.get_serializer(paginated_queryset, many=True).data
                    data = get_invoices_totals(serialized_data)
                    return paginator.get_paginated_response({
                    "status": "success",
                    "message": "Accounts retrieved successfully with pagination",
                    "data": data
                }) 

            else:
                serialized_data = self.get_serializer(queryset, many=True).data
                data = get_invoices_totals(serialized_data)

                return Response(data, status=status.HTTP_200_OK)
        
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
            queryset = self.filter_queryset(
                self.get_queryset().filter(
                    models.Q(sales__organisation=request.user.current_org) |
                    models.Q(service_income__organisation=request.user.current_org)
                ).exclude(sales=None, service_income=None)
            )

            filter_data = request.query_params.dict()
            title = request.data.get('title')
          
            serialized_data = self.get_serializer(queryset, many=True).data
            data = get_invoices_totals(serialized_data)

            pdf_generator = GenerateListsPDF(title, request.user, data, filter_data, filename='invoices.html')
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


def get_payments_totals(data, pk=None):
    amount_paid = sum(float(payment.get('amount_paid')) for payment in data)

    title = ''

    if pk:
        invoice = get_object_or_404(Invoice, pk=pk)
        if hasattr(invoice, "sales") and invoice.sales is not None:

            title = f"Payments for sales # {invoice.sales.serial_number}"

        elif hasattr(invoice, "service_income") and invoice.service_income is not None:

            title = f"Payments for service income # {invoice.service_income.serial_number}"

    return {
        "title": title,
        "payments": data,
        "totals": {
            "amount_paid": amount_paid,
        }
    }

class InvoicePaymentsApiView(generics.ListAPIView):
    serializer_class = PaymentsDetailSerializer
    queryset = Payment.objects.all()
    pagination_class = InvoicePagination
    permission_classes = [IsAuthenticated, IsUserInOrganisation]

    def get(self, request, *args, **kwargs):
        try:
            pk = kwargs.get('pk')
            organisation_id = kwargs.get('organisation_id')
            invoice = get_object_or_404(Invoice, pk=pk)
            organisation = get_object_or_404(Organisation, pk=organisation_id)
            queryset = self.get_queryset()
            queryset = queryset.filter(invoice=invoice, organisation=organisation).order_by('-date')  

            paginate = request.query_params.get('paginate')

            if paginate:
                paginator = self.pagination_class()
                paginated_queryset = paginator.paginate_queryset(queryset, request)
                if paginated_queryset is not None:
                    serialized_data = self.get_serializer(paginated_queryset, many=True).data
                    data = get_payments_totals(serialized_data, pk)
                    return paginator.get_paginated_response({
                    "status": "success",
                    "message": "Payments retrieved successfully with pagination",
                    "data": data
                }) 

            else:
                serialized_data = self.get_serializer(queryset, many=True).data
                data = get_payments_totals(serialized_data, pk)


                return Response(data, status=status.HTTP_200_OK)
        
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


class DownloadInvoicePaymentsApiView(generics.ListAPIView):
    serializer_class = PaymentsDetailSerializer
    queryset = Payment.objects.all()
    pagination_class = InvoicePagination
    permission_classes = [IsAuthenticated, IsUserInOrganisation]

    def post(self, request, *args, **kwargs):
        try:
            pk = kwargs.get('pk')
            organisation_id = kwargs.get('organisation_id')
            invoice = get_object_or_404(Invoice, pk=pk)
            organisation = get_object_or_404(Organisation, pk=organisation_id)
            queryset = self.get_queryset()
            queryset = queryset.filter(invoice=invoice, organisation=organisation).order_by('-date')  
           
            title = request.data.get('title')
          
            serialized_data = self.get_serializer(queryset, many=True).data
            data = get_payments_totals(serialized_data)


            pdf_generator = GenerateListsPDF(title, request.user, data, None, filename='single_payments.html')
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