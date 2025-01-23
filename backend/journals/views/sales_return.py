from rest_framework import generics, status, serializers
from rest_framework.response import Response
from journals.utils import flatten_errors, date_filtering, sort_filtering
from journals.models import SalesReturn, Sales
from django.db import models
from journals.serializers import SalesReturnSerializer, DetailedSalesReturnSerializer
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.pagination import PageNumberPagination
from journals.permissions import IsUserInOrganisation
from rest_framework.permissions import IsAuthenticated
from journals.utils.generate_pdfs import GenerateListsPDF
from django.http import HttpResponse
from django.shortcuts import get_object_or_404


class SalesReturnPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class SalesReturnFilter(DjangoFilterBackend, SearchFilter):
    class Meta:
        model = SalesReturn

    def filter_queryset(self, request, queryset, view):
        try:
            date = request.query_params.get('date')
            sort_by = request.query_params.get('sort_by')
            search = request.query_params.get('search')

            if date:
                queryset = date_filtering(queryset, date)

            if search:
                queryset = queryset.filter(models.Q(
                    description__icontains=search
                ) | models.Q(
                    sales__serial_number__icontains=search
                ))
        

            if sort_by:
                queryset = sort_filtering(queryset, sort_by)
                
            return queryset

        except Exception as e:
            raise Exception(str(e))

def get_totals(data, sales_id=None):
    total_amount = sum(float(sales.get('details').get('total_amount')) for sales in data)
    total_quantity = sum(float(sales.get('details').get('total_quantity')) for sales in data)

    return {
        "sales_returns": data,
        "totals": {
            "amount": total_amount,
            "quantity": total_quantity,
        }
    }    

class SalesReturnAPIView(generics.ListCreateAPIView):
    queryset = SalesReturn.objects.all().order_by('created_at')
    serializer_class = SalesReturnSerializer
    pagination_class = SalesReturnPagination
    permission_classes = [IsAuthenticated, IsUserInOrganisation]
    filter_backends = [SalesReturnFilter]
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
                    data = get_totals(serialized_data)                    
                    return paginator.get_paginated_response({
                        "status": "success",
                        "message": "Sales Returns retrieved successfully with pagination",
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
        

class DownloadSalesReturnAPIView(generics.ListCreateAPIView):
    queryset = SalesReturn.objects.all().order_by('created_at')
    serializer_class = SalesReturnSerializer
    pagination_class = SalesReturnPagination
    permission_classes = [IsAuthenticated, IsUserInOrganisation]
    filter_backends = [SalesReturnFilter]
    search_fields = ['description']


    def post(self, request, *args, **kwargs):
        try:
            queryset = self.filter_queryset(self.get_queryset().filter(organisation=request.user.current_org))

            filter_data = request.query_params.dict()
            title = request.data.get('title')
          
            serialized_data = self.get_serializer(queryset, many=True).data
            data = get_totals(serialized_data)

            pdf_generator = GenerateListsPDF(title, request.user, data, filter_data, filename='sales_returns.html')
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
        


class SalesSalesReturnsApiView(generics.ListAPIView):
    serializer_class = DetailedSalesReturnSerializer
    queryset = SalesReturn.objects.all()
    pagination_class = SalesReturnPagination
    permission_classes = [IsAuthenticated, IsUserInOrganisation]

    def get(self, request, *args, **kwargs):
        try:
            pk = kwargs.get('pk')
            sales = get_object_or_404(Sales, pk=pk)
            queryset = self.get_queryset()
            queryset = queryset.filter(sales_id=sales.id).order_by('-date')
            title = f"Sales returns for sales # {sales.serial_number}"
            paginate = request.query_params.get('paginate')

            if paginate:
                paginator = self.pagination_class()
                paginated_queryset = paginator.paginate_queryset(queryset, request)
                if paginated_queryset is not None:
                    serialized_data = self.get_serializer(paginated_queryset, many=True).data
                    data = get_totals(serialized_data)
                    data['title'] = title
                    return paginator.get_paginated_response({
                    "status": "success",
                    "message": "Sales returns retrieved successfully with pagination",
                    "data": data
                }) 

            else:
                serialized_data = self.get_serializer(queryset, many=True).data
                data = get_totals(serialized_data)
                data['title'] = title


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
        
class DownloadSalesSalesReturnsApiView(generics.ListAPIView):
    serializer_class = DetailedSalesReturnSerializer
    queryset = SalesReturn.objects.all()
    pagination_class = SalesReturnPagination
    permission_classes = [IsAuthenticated, IsUserInOrganisation]

    def post(self, request, *args, **kwargs):
        try:
            pk = kwargs.get('pk')
            queryset = self.get_queryset()
            data = queryset.filter(sales_id=pk).order_by('-date')

            title = request.data.get('title')
          
            serialized_data = self.get_serializer(queryset, many=True).data
            data = get_totals(serialized_data)

            pdf_generator = GenerateListsPDF(title, request.user, data, None, filename='returns.html')
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
        

class SalesReturnDetailApiView(generics.RetrieveAPIView):
    serializer_class = DetailedSalesReturnSerializer
    queryset = SalesReturn.objects.all()
    permission_classes = [IsAuthenticated, IsUserInOrganisation]

    def get(self, request, *args, **kwargs):
        sales_return_id = kwargs.get('pk')

        try:
            sales_return = self.get_object()
            context = self.get_serializer_context()

            date_param = request.query_params.get('date', None)
            if date_param:
                context['date'] = date_param

            serializer = self.get_serializer(sales_return, context=context)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except SalesReturn.DoesNotExist:
            return Response({
                'error': 'Not Found',
                'details': f'The sales_return of ID {sales_return_id} does not exist.'
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
        sales_return_id = kwargs.get('pk')
        try:
            partial = kwargs.pop('partial', True)
            data = request.data.copy()
            instance = self.get_object()
            if request.user != instance.user:
                raise serializers.ValidationError(f"SalesReturn {sales_return_id} can only be edited by user who recorded it")
            serializer = self.get_serializer(instance, data=data, partial=partial)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        except SalesReturn.DoesNotExist:
            return Response({
                'error': 'Not Found',
                'details': f'The sales_return of ID {sales_return_id} does not exist.'
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
        sales_return_id = kwargs.get('pk')

        try:
            instance = self.get_object()

            if request.user != instance.user:
                raise serializers.ValidationError(f"Sales Return {sales_return_id} can only be deleted by user who recorded it")
        
            sales = getattr(instance, 'sales', None)
            if sales:
                print(f"Sales associated with instance: {sales}")

                # Step 2: Get associated invoice
                invoice = getattr(sales, 'invoice', None)
                if invoice:
                    print(f"Invoice associated with sales: {invoice}")
                    print(f'Invoice initial total amount {invoice.total_amount}, amount due {invoice.amount_due}')

                    try:
                        # Step 3: Adjust total_amount by adding back the invoice amount
                        total_amount = invoice.total_amount + instance.invoice_amount
                        print(f"Adjusted total amount: {total_amount}")

                        if total_amount < 0:
                            raise serializers.ValidationError(
                                f"Total amount {total_amount} cannot be negative"
                            )

                        # Step 4: Calculate the new amount due
                        amount_due = total_amount - invoice.amount_paid
                        print(f"New amount due calculated: {amount_due}")

                        if amount_due < 0:
                            if invoice.amount_paid > total_amount:
                                raise serializers.ValidationError(
                                    f"Amount paid {invoice.amount_paid} cannot be more than invoice total amount {total_amount}"
                                )

                        # Step 5: Update invoice fields
                        invoice.total_amount = total_amount
                        invoice.amount_due = amount_due

                        if invoice.amount_paid == total_amount:
                            invoice.status = "paid"
                        elif invoice.amount_paid == 0:
                            invoice.status = "unpaid"
                        else:
                            invoice.status = "partially_paid"

                        # Step 6: Save the updated invoice
                        invoice.save()
                        print(f"Updated invoice: {invoice}")

                    except Exception as e:
                        print(f"Error during invoice update: {str(e)}")
                        raise serializers.ValidationError(f"Error updating invoice: {str(e)}")

                else:
                    raise serializers.ValidationError("Sales has no associated invoice")

                # Step 7: Handle return entries if available
                return_entries = instance.return_entries.all()
                if return_entries:
                    print(f"Processing return entries: {return_entries}")
                    for entry in return_entries:
                        sales_entry = getattr(entry, 'sales_entry', None)
                        if sales_entry:
                            sales_entry.remaining_quantity += entry.return_quantity
                            sales_entry.save()
                            print(f"Updated sales entry: {sales_entry}")
                        else:
                            raise serializers.ValidationError("Return entry has no sales entry")
                else:
                    raise serializers.ValidationError("Sales return has no return entries")

            else:
                raise serializers.ValidationError("Sales return has no associated sales")

            # Step 8: Delete the instance
            
            instance.delete()
            print(f"Sales return deleted successfully: {instance}")
            return Response({"detail": "Sales return deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            raise e
            print(f"Error deleting Sales Return: {str(e)}")
            raise serializers.ValidationError({"error": f"Error deleting Sales Return: {str(e)}"})

            return Response({"details": response}, status=status.HTTP_204_NO_CONTENT)
            
        except SalesReturn.DoesNotExist:
            return Response({
                'error': 'Not Found',
                'details': f'The sales_return with ID {sales_return_id} does not exist.'
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