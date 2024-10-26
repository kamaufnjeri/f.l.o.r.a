from rest_framework import generics, status, serializers
from django.db import models
from rest_framework.response import Response
from journals.utils import flatten_errors, due_days_filtering, status_filtering
from journals.models import Journal, Bill, Purchase, Payment
from journals.serializers import JournalBillSerializer, PurchaseBillSerializer, BillDetailSerializer, PaymentSerializer
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from journals.permissions import IsUserInOrganisation

    
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
                serial_number__icontains=search
            ) | models.Q(supplier__name__icontains=search))

        if status:
            queryset = status_filtering(queryset, status)
            
        if due_days:
            queryset = due_days_filtering(queryset, due_days)
        return queryset
        
class BillApiView(generics.ListAPIView):
    queryset = Bill.objects.all().order_by('created_at')
    serializer_class = BillDetailSerializer
    permission_classes = [IsAuthenticated, IsUserInOrganisation]
    pagination_class = BillPagination
    filter_backends = [BillFilter]
    search_fields = ['serial_number', 'supplier']

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
            return Response({
                'error': 'Internal server error',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PurchaseBillAPIView(generics.CreateAPIView):
    queryset = Purchase.objects.filter(bill__isnull=False)
    serializer_class = PurchaseBillSerializer
    permission_classes = [IsUserInOrganisation, IsAuthenticated]


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



class JournalBillAPIView(generics.CreateAPIView):
    queryset = Journal.objects.filter(bill__isnull=False)
    serializer_class = JournalBillSerializer
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


class BillPaymentsApiView(generics.ListAPIView):
    serializer_class = PaymentSerializer
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
