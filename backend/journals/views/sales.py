from rest_framework import generics, status, serializers
from rest_framework.response import Response
from journals.utils import flatten_errors, date_filtering, sort_filtering
from journals.models import Sales, SalesReturn
from journals.serializers import SalesSerializer, SalesDetailSerializer, SalesReturnSerializer
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.pagination import PageNumberPagination
from journals.permissions import IsUserInOrganisation
from rest_framework.permissions import IsAuthenticated
from journals.utils.generate_pdfs import GenerateListsPDF
from django.http import HttpResponse

class SalesPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class SalesFilter(DjangoFilterBackend):
    class Meta:
        model = Sales

    def filter_queryset(self, request, queryset, view):
        try:
            sales = request.query_params.get('sales')
            date = request.query_params.get('date')
            sort_by = request.query_params.get('sort_by')

            if date:
                queryset = date_filtering(queryset, date)
            
            if sales:
                if sales == "is_invoices":
                    queryset = queryset.filter(invoice__isnull=False)
                elif sales == "is_not_invoices":
                    queryset = queryset.filter(invoice__isnull=True)
                elif sales == "all":
                    queryset = queryset.all()
                else:
                    raise Exception("Valid options for sales are 'is_invoices' or 'is_not_invoices' or 'all'")
            else:
                queryset = queryset.all()

            if sort_by:
                queryset = sort_filtering(queryset, sort_by)
            return queryset

        except Exception as e:
            raise Exception(str(e))

def get_totals(data):
    total_amount = sum(float(sale.get('details').get('total_amount')) for sale in data)
    total_quantity = sum(float(sale.get('details').get('total_quantity')) for sale in data)
    amount_due = sum(float(sale.get('details').get('amount_due')) for sale in data)

    return {
        "sales": data,
        "totals": {
            "amount": total_amount,
            "quantity": total_quantity,
            "amount_due": amount_due
        }
    }

class SalesAPIView(generics.ListCreateAPIView):
    queryset = Sales.objects.all().order_by('created_at')
    serializer_class = SalesSerializer
    pagination_class = SalesPagination
    permission_classes = [IsAuthenticated, IsUserInOrganisation]
    filter_backends = [SalesFilter, SearchFilter]
    search_fields = ['serial_number', 'description']

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
                    "message": "Sales retrieved successfully with pagination",
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
            print(f"Validation Error: {errors}") 
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

class DownloadSalesAPIView(generics.ListCreateAPIView):
    queryset = Sales.objects.all().order_by('created_at')
    serializer_class = SalesSerializer
    pagination_class = SalesPagination
    permission_classes = [IsAuthenticated, IsUserInOrganisation]
    filter_backends = [SalesFilter, SearchFilter]
    search_fields = ['serial_number', 'description'] 

    def post(self, request, *args, **kwargs):
        try:
            queryset = self.filter_queryset(self.get_queryset().filter(organisation=request.user.current_org))

            filter_data = request.query_params.dict()
            title = request.data.get('title')
          
            serialized_data = self.get_serializer(queryset, many=True).data
            data = get_totals(serialized_data)

            pdf_generator = GenerateListsPDF(title, request.user, data, filter_data, filename='sales.html')
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


class SalesDetailAPIView(generics.RetrieveAPIView):
    serializer_class = SalesDetailSerializer
    queryset = Sales.objects.all()
    permission_classes = [IsAuthenticated, IsUserInOrganisation]


    def get(self, request, *args, **kwargs):
        sale_id = kwargs.get('pk')

        try:
            sale = self.get_object()
            context = self.get_serializer_context()

            date_param = request.query_params.get('date', None)
            if date_param:
                context['date'] = date_param

            serializer = self.get_serializer(sale, context=context)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Sales.DoesNotExist:
            return Response({
                'error': 'Not Found',
                'details': f'The sale of ID {sale_id} does not exist.'
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
        sale_id = kwargs.get('pk')
        try:
            partial = kwargs.pop('partial', True)
            data = request.data.copy()
            instance = self.get_object()
            if request.user != instance.user:
                raise serializers.ValidationError(f"Sales {sale_id} can only be edited by user who recorded it")
            serializer = self.get_serializer(instance, data=data, partial=partial)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Sales.DoesNotExist:
            return Response({
                'error': 'Not Found',
                'details': f'The sale of ID {sale_id} does not exist.'
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
        sale_id = kwargs.get('pk')

        try:
            instance = self.get_object()

            if request.user != instance.user:
                raise serializers.ValidationError(f"Sales {sale_id} can only be deleted by user who recorded it")
            
            instance.delete() 
            return Response({"detail": "Sales item deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
            
        except Sales.DoesNotExist:
            return Response({
                'error': 'Not Found',
                'details': f'The sale with ID {sale_id} does not exist.'
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

