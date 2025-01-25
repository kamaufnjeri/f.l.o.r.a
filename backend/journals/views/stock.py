from rest_framework import generics, serializers, status
from journals.models import Stock
from journals.serializers import StockSerializer, StockDetailsSerializer
from rest_framework.response import Response
from journals.utils import flatten_errors
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.pagination import PageNumberPagination
from journals.permissions import IsUserInOrganisation
from journals.utils.generate_pdfs import GenerateListsPDF
from django.http import HttpResponse
from rest_framework.permissions import IsAuthenticated


class StockPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

def get_totals(data):
    quantity = sum(int(stock.get('total_quantity')) for stock in data)
    return {
        "stocks": data,
        "totals": {
            "quantity": quantity
        }
    }

class StockAPIView(generics.ListCreateAPIView):
    queryset = Stock.objects.all().order_by('created_at')
    serializer_class = StockSerializer
    pagination_class = StockPagination
    permission_classes = [IsAuthenticated, IsUserInOrganisation]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    search_fields = ['name']

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
                    "message": "Products retrieved successfully with pagination",
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
            raise e
            print(f"Internal Error: {e}") 
            return Response({
                'error': 'Internal server error',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class DownloadStockAPIView(generics.ListCreateAPIView):
    queryset = Stock.objects.all().order_by('created_at')
    serializer_class = StockSerializer
    pagination_class = StockPagination
    permission_classes = [IsAuthenticated, IsUserInOrganisation]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    search_fields = ['name']

    def post(self, request, *args, **kwargs):
        try:
            queryset = self.filter_queryset(self.get_queryset().filter(organisation=request.user.current_org))

            filter_data = request.query_params.dict()
            title = request.data.get('title')
          
            serialized_data = self.get_serializer(queryset, many=True).data
            data = get_totals(serialized_data)

            pdf_generator = GenerateListsPDF(title, request.user, data, filter_data, filename='stocks.html')
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

        

class StockDetailAPIView(generics.RetrieveAPIView):
    queryset = Stock.objects.all()
    serializer_class = StockDetailsSerializer
    permission_classes = [IsAuthenticated, IsUserInOrganisation]


    def get(self, request, *args, **kwargs):
        stock_id = kwargs.get('pk')

        try:
            stock = Stock.objects.get(id=stock_id)
            context = self.get_serializer_context()

            date_param = request.query_params.get('date', None)
            if date_param:
                context['date'] = date_param

            serializer = self.serializer_class(stock, context=context)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Stock.DoesNotExist:
            return Response({
                'error': 'Not Found',
                'details': f'The stock of ID {stock_id} does not exist.'
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
        stock_id = kwargs.get('pk')
        try:
            partial = kwargs.pop('partial', True)
            data = request.data.copy()
            data['organisation'] = kwargs.get('organisation_id')
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=data, partial=partial)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Stock.DoesNotExist:
            return Response({
                'error': 'Not Found',
                'details': f'The stock of ID {stock_id} does not exist.'
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
        stock_id = kwargs.get('pk')

        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)

            has_entries = False
            
            for data in serializer.data.get('stock_summary', {}).get('totals', []):
                quantity = data.get('quantity', 0)
                name = data.get('name')
                if name in ('Sales', 'Purchases', 'Sales Returns', 'Purchase Returns') and quantity > 0:
                    has_entries = True
                    break

            if not has_entries:
                instance.delete() 
                return Response({"detail": "Stock item deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
            else:
                raise serializers.ValidationError("Cannot delete stock with associated entries or non-zero closing stock.")

        except Stock.DoesNotExist:
            return Response({
                'error': 'Not Found',
                'details': f'The stock with ID {stock_id} does not exist.'
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



class DownloadStockDetailAPIView(generics.RetrieveAPIView):
    queryset = Stock.objects.all()
    serializer_class = StockDetailsSerializer
    permission_classes = [IsAuthenticated, IsUserInOrganisation]


    def post(self, request, *args, **kwargs):
        stock_id = kwargs.get('pk')

        try:
            stock = self.get_object()
            context = self.get_serializer_context()
            title = request.data.get('title')


            filter_data = request.query_params.dict()
            date_param = filter_data.get('date', None)
            if date_param:
                context['date'] = date_param

            serializer = self.serializer_class(stock, context=context)


            pdf_generator = GenerateListsPDF(title, request.user, serializer.data, filter_data, filename='single_stock_summary.html')
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
