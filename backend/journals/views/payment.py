from rest_framework import generics, status, serializers
from rest_framework.response import Response
from journals.utils import flatten_errors, date_filtering, sort_filtering
from journals.models import Payment
from journals.serializers import PaymentSerializer, PaymentsDetailSerializer
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
                if type == "is_bills":
                    queryset = queryset.filter(bill__isnull=False)
                elif type == "is_invoices":
                    queryset = queryset.filter(invoice__isnull=False)
                elif type == "all":
                    queryset = queryset
                else:
                    raise ValueError("Invalid options: Expected options 'bills', 'invoices' or 'all'")

            if search:
                queryset = queryset.filter(
                    models.Q(description__icontains=search) |
                    models.Q(bill__purchase__serial_number__icontains=search) |
                    models.Q(invoice__sales__serial_number__icontains=search) |
                    models.Q(invoice__service_income__serial_number__icontains=search)
                )

        
            if sort_by:
                queryset = sort_filtering(queryset, sort_by)
                
            return queryset

        except Exception as e:
            raise Exception(str(e))
        
def get_payments_totals(data):
    amount_paid = sum(float(payment.get('amount_paid')) for payment in data)

    return {
        "payments": data,
        "totals": {
            "amount_paid": amount_paid,
        }
    }    

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

                    serialized_data = self.get_serializer(paginated_queryset, many=True).data
                    data = get_payments_totals(serialized_data)

                    
                    return paginator.get_paginated_response({
                    "status": "success",
                    "message": "Payments retrieved successfully with pagination",
                    "data": data
                }) 

            else:
                serialized_data = self.get_serializer(queryset, many=True).data
                data = get_payments_totals(serialized_data)

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
            raise e
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
          
            serialized_data = self.get_serializer(queryset, many=True).data
            data = get_payments_totals(serialized_data)

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


class PaymentDetailAPIView(generics.RetrieveAPIView):
    serializer_class = PaymentsDetailSerializer
    queryset = Payment.objects.all()
    permission_classes = [IsAuthenticated, IsUserInOrganisation]

    def get(self, request, *args, **kwargs):
        payment_id = kwargs.get('pk')

        try:
            payment = self.get_object()
            context = self.get_serializer_context()

            date_param = request.query_params.get('date', None)
            if date_param:
                context['date'] = date_param

            serializer = self.get_serializer(payment, context=context)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Payment.DoesNotExist:
            return Response({
                'error': 'Not Found',
                'details': f'The payment of ID {payment_id} does not exist.'
            }, status=status.HTTP_404_NOT_FOUND)

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
    
    def patch(self, request, *args, **kwargs):
        payment_id = kwargs.get('pk')
        try:
            partial = kwargs.pop('partial', True)
            data = request.data.copy()
            instance = self.get_object()
            if request.user != instance.user:
                raise serializers.ValidationError(f"Payment {payment_id} can only be edited by user who recorded it")
            serializer = self.get_serializer(instance, data=data, partial=partial)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Payment.DoesNotExist:
            return Response({
                'error': 'Not Found',
                'details': f'The payment of ID {payment_id} does not exist.'
            }, status=status.HTTP_404_NOT_FOUND)

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
        
    def delete(self, request, *args, **kwargs):
        payment_id = kwargs.get('pk')

        try:
            instance = self.get_object()

            if request.user != instance.user:
                raise serializers.ValidationError(f"Payment {payment_id} can only be deleted by user who recorded it")
            
            bill_invoice = getattr(instance, 'bill', None) or getattr(instance, 'invoice', None)
            if bill_invoice:
                amount_paid = instance.amount_paid
                bill_invoice.amount_paid -= amount_paid
                bill_invoice.amount_due += amount_paid

                if bill_invoice.amount_paid  < 0:
                    raise serializers.ValidationError("Total amount paid cannot be less than zero.")
                
                if bill_invoice.amount_paid <= 0:
                    bill_invoice.status = "unpaid"
                elif bill_invoice.amount_paid < bill_invoice.total_amount:
                    bill_invoice.status = "partially_paid"
                elif bill_invoice.amount_paid >= bill_invoice.total_amount:
                    bill_invoice.status = "paid"
                

                bill_invoice.save()
            else:
                raise serializers.ValidationError(f"Payment has no bill or invoice asscoiated with it")

           
            instance.delete() 
            return Response({"detail": "Payment item deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
            
        except Payment.DoesNotExist:
            return Response({
                'error': 'Not Found',
                'details': f'The payment with ID {payment_id} does not exist.'
            }, status=status.HTTP_404_NOT_FOUND)

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