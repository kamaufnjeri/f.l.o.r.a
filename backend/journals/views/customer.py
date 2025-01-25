from journals.models import Customer
from journals.serializers import CustomerSerializer, CustomerDetailSerializer
from rest_framework import generics, status, serializers
from rest_framework.response import Response
from journals.utils import flatten_errors
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from journals.permissions import IsUserInOrganisation
from journals.utils.generate_pdfs import GenerateListsPDF
from django.http import HttpResponse


class CustomerPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

def get_totals(data):
    amount_due = sum(float(customer.get('amount_due')) for customer in data)
    return {
        "customers": data,
        "totals": {
            "amount_due": amount_due
        }
    }

class CustomerAPIVew(generics.ListCreateAPIView):
    queryset = Customer.objects.all().order_by('created_at')
    serializer_class = CustomerSerializer
    pagination_class = CustomerPagination
    filter_backends = [DjangoFilterBackend, SearchFilter]
    search_fields = ['name']
    permission_classes = [IsAuthenticated, IsUserInOrganisation]

    def get(self, request, *args, **kwargs):
        try:
            queryset = self.filter_queryset(self.get_queryset().filter(organisation=request.user.current_org))

            paginate = request.query_params.get('paginate')

            if paginate:
                paginator = self.pagination_class()
                paginated_queryset = paginator.paginate_queryset(queryset, request)
                if paginated_queryset is not None:
                    serialized_data = self.get_serializer(paginated_queryset, many=True).data
                    data = get_totals(serialized_data)
                    return paginator.get_paginated_response({
                    "status": "success",
                    "message": "Customers retrieved successfully with pagination",
                    "data": data
                }) 

            else:
                serialized_data = self.get_serializer(queryset, many=True).data
                data = get_totals(serialized_data)

                return Response(data, status=status.HTTP_200_OK)
        
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

   
class DownloadCustomerAPIVew(generics.ListCreateAPIView):
    queryset = Customer.objects.all().order_by('created_at')
    serializer_class = CustomerSerializer
    pagination_class = CustomerPagination
    filter_backends = [DjangoFilterBackend, SearchFilter]
    search_fields = ['name']
    permission_classes = [IsAuthenticated, IsUserInOrganisation]

    def post(self, request, *args, **kwargs):
        try:
            queryset = self.filter_queryset(self.get_queryset().filter(organisation=request.user.current_org))

            filter_data = request.query_params.dict()
            title = request.data.get('title')
          
            serialized_data = self.get_serializer(queryset, many=True).data
            data = get_totals(serialized_data)

            pdf_generator = GenerateListsPDF(title, request.user, data, filter_data, filename='users.html')
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
        

class CustomerDetailsAPIView(generics.RetrieveAPIView):
    queryset = Customer.objects.all()
    serializer_class = CustomerDetailSerializer
    permission_classes = [IsAuthenticated, IsUserInOrganisation]

    def get(self, request, *args, **kwargs):
        customer_id = kwargs.get('pk')

        try:
            customer = self.get_object()
            context = self.get_serializer_context()

            date_param = request.query_params.get('date', None)
            if date_param:
                context['date'] = date_param

            serializer = self.get_serializer(customer, context=context)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Customer.DoesNotExist:
            return Response({
                'error': 'Not Found',
                'details': f'The customer of ID {customer_id} does not exist.'
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
        customer_id = kwargs.get('pk')
        try:
            partial = kwargs.pop('partial', True)
            data = request.data.copy()
            data['organisation'] = kwargs.get('organisation_id')
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=data, partial=partial)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Customer.DoesNotExist:
            return Response({
                'error': 'Not Found',
                'details': f'The customer of ID {customer_id} does not exist.'
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
        customer_id = kwargs.get('pk')

        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)

            has_entries = False
            
            totals = serializer.data.get('customer_data', {}).get('totals', {})
            amount_paid = totals.get('amount_paid', 0)
            amount_due = totals.get('amount_due', 0)
            if amount_paid > 0 or amount_due > 0:
                has_entries = True

            if not has_entries:
                account = instance.account
                if account:
                    account.delete()
                instance.delete() 
                return Response({"detail": "Customer item deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
            else:
                raise serializers.ValidationError("Cannot delete customer with associated invoices.")

        except Customer.DoesNotExist:
            return Response({
                'error': 'Not Found',
                'details': f'The customer with ID {customer_id} does not exist.'
            }, status=status.HTTP_404_NOT_FOUND)

        except serializers.ValidationError as e:
            errors = flatten_errors(e.detail)
            return Response({
                'error': 'Bad Request',
                'details': errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        except Exception as e:
            return Response({
                'error': 'Internal Server Error',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DownloadCustomerDetailAPIView(generics.RetrieveAPIView):
    queryset = Customer.objects.all()
    serializer_class = CustomerDetailSerializer
    permission_classes = [IsAuthenticated, IsUserInOrganisation]


    def post(self, request, *args, **kwargs):
        customer_id = kwargs.get('pk')

        try:
            customer = self.get_object()
            context = self.get_serializer_context()
            title = request.data.get('title')


            filter_data = request.query_params.dict()
            date_param = filter_data.get('date', None)
            if date_param:
                context['date'] = date_param

            serializer = self.serializer_class(customer, context=context)


            pdf_generator = GenerateListsPDF(title, request.user, serializer.data, filter_data, filename='single_customer.html')
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
