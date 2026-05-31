from journals.models import Purchase, PurchaseReturn
from rest_framework.response import Response
from journals.utils import flatten_errors, date_filtering, sort_filtering
from rest_framework import generics, status, serializers
from journals.serializers import PurchaseSerializer, PurchaseDetailSerializer, PurchaseReturnSerializer
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.pagination import PageNumberPagination
from journals.permissions import IsUserInOrganisation
from rest_framework.permissions import IsAuthenticated
from journals.utils.generate_pdfs import GenerateListsPDF
from django.http import HttpResponse

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

def get_totals(data):
    total_amount = sum(float(purchase.get('details').get('total_amount')) for purchase in data)
    total_quantity = sum(float(purchase.get('details').get('total_quantity')) for purchase in data)
    amount_due = sum(float(purchase.get('details').get('amount_due')) for purchase in data)

    return {
        "purchases": data,
        "totals": {
            "amount": total_amount,
            "quantity": total_quantity,
            "amount_due": amount_due
        }
    }


class PurchaseAPIView(generics.ListCreateAPIView):
    queryset = Purchase.objects.all().order_by('created_at')
    serializer_class = PurchaseSerializer
    pagination_class = PurchasePagination
    permission_classes = [IsAuthenticated, IsUserInOrganisation]
    filter_backends = [PurchaseFilter, SearchFilter]
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
                    "message": "Purchases retrieved successfully with pagination",
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
            return Response({
                'error': 'Internal server error',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class DownloadPurchaseAPIView(generics.ListCreateAPIView):
    queryset = Purchase.objects.all().order_by('created_at')
    serializer_class = PurchaseSerializer
    pagination_class = PurchasePagination
    permission_classes = [IsAuthenticated, IsUserInOrganisation]
    filter_backends = [PurchaseFilter, SearchFilter]
    search_fields = ['serial_number', 'description']

    def post(self, request, *args, **kwargs):
        try:
            queryset = self.filter_queryset(self.get_queryset().filter(organisation=request.user.current_org))

            filter_data = request.query_params.dict()
            title = request.data.get('title')
          
            serialized_data = self.get_serializer(queryset, many=True).data
            data = get_totals(serialized_data)

            pdf_generator = GenerateListsPDF(title, request.user, data, filter_data, filename='purchases.html')
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


class PurchaseDetailAPIView(generics.RetrieveAPIView):
    serializer_class = PurchaseDetailSerializer
    queryset = Purchase.objects.all()
    permission_classes = [IsAuthenticated, IsUserInOrganisation]

    def get(self, request, *args, **kwargs):
        purchase_id = kwargs.get('pk')

        try:
            purchase = self.get_object()
            context = self.get_serializer_context()

            date_param = request.query_params.get('date', None)
            if date_param:
                context['date'] = date_param

            serializer = self.get_serializer(purchase, context=context)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Purchase.DoesNotExist:
            return Response({
                'error': 'Not Found',
                'details': f'The purchase of ID {purchase_id} does not exist.'
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
        purchase_id = kwargs.get('pk')
        try:
            partial = kwargs.pop('partial', True)
            data = request.data.copy()
            instance = self.get_object()
            if request.user != instance.user:
                raise serializers.ValidationError(f"Purchase {purchase_id} can only be edited by user who recorded it")
            serializer = self.get_serializer(instance, data=data, partial=partial)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Purchase.DoesNotExist:
            return Response({
                'error': 'Not Found',
                'details': f'The purchase of ID {purchase_id} does not exist.'
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
        purchase_id = kwargs.get('pk')

        try:
            instance = self.get_object()
            serialized_data = self.get_serializer(instance).data

            if request.user != instance.user:
                raise serializers.ValidationError(f"Purchase {purchase_id} can only be deleted by user who recorded it")
            for entry in serialized_data.get('purchase_entries'):
                from journals.utils import PurchaseEntriesManager
                from journals.serializers import StockSerializer
                stock = StockSerializer(PurchaseEntriesManager().get_stock(entry_data=entry)).data
                new_stock_balance = int(stock.get('total_quantity')) - int(entry.get('remaining_quantity'))
                if new_stock_balance < 0:
                    raise serializers.ValidationError(f"Cannot delete purchase since {entry.get('stock_name')} will have negative remaining quantity")

            instance.delete() 
            return Response({"detail": "Purchase item deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
            
        except Purchase.DoesNotExist:
            return Response({
                'error': 'Not Found',
                'details': f'The purchase with ID {purchase_id} does not exist.'
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


