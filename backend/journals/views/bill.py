from rest_framework import generics, status, serializers
from django.db import models
from rest_framework.response import Response
from journals.utils import flatten_errors, due_days_filtering, status_filtering
from journals.models import Bill, Payment
from journals.serializers import BillDetailSerializer, PaymentsDetailSerializer
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from journals.permissions import IsUserInOrganisation
from journals.utils.generate_pdfs import GenerateListsPDF
from django.http import HttpResponse
from django.shortcuts import get_object_or_404


class BillPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class BillFilter(DjangoFilterBackend, SearchFilter):
    class Meta:
        model = Bill

    def filter_queryset(self, request, queryset, view):
        search = request.query_params.get("search")
        due_days = request.query_params.get("due_days")
        status = request.query_params.get("status")

        if search:
            queryset = queryset.filter(models.Q(
                purchase__serial_number__icontains=search
            ) | models.Q(supplier__name__icontains=search))

        if status:
            queryset = status_filtering(queryset, status)
            
        if due_days:
            queryset = due_days_filtering(queryset, due_days)
        return queryset

def get_bills_totals(data):
    amount_due = sum(float(bill.get('amount_due')) for bill in data)
    amount_paid = sum(float(bill.get('amount_paid')) for bill in data)

    return { 
        "bills": data,
        "totals": {
            "amount_paid": amount_paid,
            "amount_due": amount_due
        }
    }

class BillApiView(generics.ListAPIView):
    queryset = Bill.objects.all().order_by('created_at')
    serializer_class = BillDetailSerializer
    permission_classes = [IsAuthenticated, IsUserInOrganisation]
    pagination_class = BillPagination
    filter_backends = [BillFilter]
    search_fields = ['serial_number', 'supplier']

    def get(self, request, *args, **kwargs):
        try:
            queryset = self.filter_queryset(self.get_queryset().filter(purchase__organisation=request.user.current_org))
            paginate = request.query_params.get('paginate')

            if paginate:
                paginator = self.pagination_class()
                paginated_queryset = paginator.paginate_queryset(queryset, request)
                if paginated_queryset is not None:
                    serialized_data = self.get_serializer(paginated_queryset, many=True).data
                    data = get_bills_totals(serialized_data)
                    return paginator.get_paginated_response({
                    "status": "success",
                    "message": "Bills retrieved successfully with pagination",
                    "data": data
                }) 

            else:
                serialized_data = self.get_serializer(queryset, many=True).data
                data = get_bills_totals(serialized_data)

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

class DownloadBillApiView(generics.ListAPIView):
    queryset = Bill.objects.all().order_by('created_at')
    serializer_class = BillDetailSerializer
    permission_classes = [IsAuthenticated, IsUserInOrganisation]
    pagination_class = BillPagination
    filter_backends = [BillFilter]
    search_fields = ['serial_number', 'supplier']

    def post(self, request, *args, **kwargs):
        try:
            queryset = self.filter_queryset(self.get_queryset().filter(purchase__organisation=request.user.current_org))

            filter_data = request.query_params.dict()
            title = request.data.get('title')
          
            serialized_data = self.get_serializer(queryset, many=True).data
            data = get_bills_totals(serialized_data)

            pdf_generator = GenerateListsPDF(title, request.user, data, filter_data, filename='bills.html')
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
        bill = get_object_or_404(Bill, pk=pk)
        title = f"Payments for purchase # {bill.purchase.serial_number}"

    return {
        "title": title,
        "payments": data,
        "totals": {
            "amount_paid": amount_paid,
        }
    }

class BillPaymentsApiView(generics.ListAPIView):
    serializer_class = PaymentsDetailSerializer
    queryset = Payment.objects.all()
    pagination_class = BillPagination
    permission_classes = [IsAuthenticated, IsUserInOrganisation]


    def get(self, request, *args, **kwargs):
        try:
            pk = kwargs.get('pk')
            
            queryset = self.get_queryset()
            queryset = queryset.filter(bill_id=pk).order_by('-date')

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


class DownloadBillPaymentsApiView(generics.ListAPIView):
    serializer_class = PaymentsDetailSerializer
    queryset = Payment.objects.all()
    pagination_class = BillPagination
    permission_classes = [IsAuthenticated, IsUserInOrganisation]

    def post(self, request, *args, **kwargs):
        try:
            pk = kwargs.get('pk')
            queryset = self.get_queryset()
            data = queryset.filter(bill_id=pk).order_by('-date')
           
            title = request.data.get('title')
          
            serialized_data = self.get_serializer(queryset, many=True).data
            data = get_payments_totals(serialized_data.data)

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