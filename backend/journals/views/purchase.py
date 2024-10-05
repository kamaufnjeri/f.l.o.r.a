from journals.models import Purchase, PurchaseReturn
from rest_framework.response import Response
from journals.utils import flatten_errors, date_filtering, sort_filtering
from rest_framework import generics, status, serializers
from journals.serializers import PurchaseSerializer, PurchaseDetailSerializer, PurchaseReturnSerializer
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.pagination import PageNumberPagination



class PurchasePagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class PurchaseFilter(DjangoFilterBackend):
    class Meta:
        model = Purchase

    def filter_queryset(self, request, queryset, view):
        try:
            purchases = request.query_params.get('purchases')
            date = request.query_params.get('date')
            sort_by = request.query_params.get('sort_by')

            if date:
                queryset = date_filtering(queryset, date)
            
            if purchases:
                if purchases == "is_bills":
                    queryset = queryset.filter(bill__isnull=False)
                elif purchases == "is_not_bills":
                    queryset =queryset.filter(bill__isnull=True)
                elif purchases == "all":
                    queryset = queryset.all()
                else:
                    raise Exception("Valid options for purchases are 'is_bills' or 'is_not_bills' or 'all'")
            else:
                queryset = queryset

            if sort_by:
                queryset = sort_filtering(queryset, sort_by)
                
            return queryset

        except Exception as e:
            raise Exception(str(e))



class PurchaseAPIView(generics.ListCreateAPIView):
    queryset = Purchase.objects.all()
    serializer_class = PurchaseSerializer
    pagination_class = PurchasePagination
    filter_backends = [PurchaseFilter, SearchFilter]
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
        

class PurchaseDetailAPIView(generics.RetrieveAPIView):
    serializer_class = PurchaseDetailSerializer
    queryset = Purchase.objects.all()


class PurchasePurchaseReturnsApiView(generics.ListAPIView):
    serializer_class = PurchaseReturnSerializer
    queryset = PurchaseReturn.objects.all()
    pagination_class = PurchasePagination

    def get(self, request, *args, **kwargs):
        try:
            pk = kwargs.get('pk')
            queryset = self.get_queryset()
            queryset = queryset.filter(purchase_id=pk).order_by('-date')

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
