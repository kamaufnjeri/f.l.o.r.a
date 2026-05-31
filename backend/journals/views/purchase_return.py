from rest_framework import generics, status, serializers
from rest_framework.response import Response
from journals.utils import flatten_errors, date_filtering, sort_filtering
from journals.models import PurchaseReturn, Purchase
from django.db import models
from journals.serializers import PurchaseReturnSerializer, DetailedPurchaseReturnSerializer
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.pagination import PageNumberPagination
from journals.permissions import IsUserInOrganisation
from rest_framework.permissions import IsAuthenticated
from journals.utils.generate_pdfs import GenerateListsPDF
from django.http import HttpResponse
from django.shortcuts import get_object_or_404


class PurchaseReturnPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class PurchaseReturnFilter(DjangoFilterBackend, SearchFilter):
    class Meta:
        model = PurchaseReturn

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
                    purchase__serial_number__icontains=search
                ))
        

            if sort_by:
                queryset = sort_filtering(queryset, sort_by)
                
            return queryset

        except Exception as e:
            raise Exception(str(e))

def get_totals(data, purchase_id=None):
    total_amount = sum(float(purchase.get('details').get('total_amount')) for purchase in data)
    total_quantity = sum(float(purchase.get('details').get('total_quantity')) for purchase in data)

    return {
        "purchase_returns": data,
        "totals": {
            "amount": total_amount,
            "quantity": total_quantity,
        }
    }    

class PurchaseReturnAPIView(generics.ListCreateAPIView):
    queryset = PurchaseReturn.objects.all().order_by('created_at')
    serializer_class = PurchaseReturnSerializer
    pagination_class = PurchaseReturnPagination
    permission_classes = [IsAuthenticated, IsUserInOrganisation]
    filter_backends = [PurchaseReturnFilter]
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
                        "message": "Purchase Returns retrieved successfully with pagination",
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
        

class DownloadPurchaseReturnAPIView(generics.ListCreateAPIView):
    queryset = PurchaseReturn.objects.all().order_by('created_at')
    serializer_class = PurchaseReturnSerializer
    pagination_class = PurchaseReturnPagination
    permission_classes = [IsAuthenticated, IsUserInOrganisation]
    filter_backends = [PurchaseReturnFilter]
    search_fields = ['description']


    def post(self, request, *args, **kwargs):
        try:
            queryset = self.filter_queryset(self.get_queryset().filter(organisation=request.user.current_org))

            filter_data = request.query_params.dict()
            title = request.data.get('title')
          
            serialized_data = self.get_serializer(queryset, many=True).data
            data = get_totals(serialized_data)

            pdf_generator = GenerateListsPDF(title, request.user, data, filter_data, filename='purchase_returns.html')
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
        


class PurchasePurchaseReturnsApiView(generics.ListAPIView):
    serializer_class = DetailedPurchaseReturnSerializer
    queryset = PurchaseReturn.objects.all()
    pagination_class = PurchaseReturnPagination
    permission_classes = [IsAuthenticated, IsUserInOrganisation]

    def get(self, request, *args, **kwargs):
        try:
            pk = kwargs.get('pk')
            purchase = get_object_or_404(Purchase, pk=pk)
            queryset = self.get_queryset()
            queryset = queryset.filter(purchase_id=purchase.id).order_by('-date')
            title = f"Purchase returns for purchase # {purchase.serial_number}"
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
                    "message": "Purchase returns retrieved successfully with pagination",
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
        
class DownloadPurchasePurchaseReturnsApiView(generics.ListAPIView):
    serializer_class = DetailedPurchaseReturnSerializer
    queryset = PurchaseReturn.objects.all()
    pagination_class = PurchaseReturnPagination
    permission_classes = [IsAuthenticated, IsUserInOrganisation]

    def post(self, request, *args, **kwargs):
        try:
            pk = kwargs.get('pk')
            queryset = self.get_queryset()
            queryset = queryset.filter(purchase_id=pk).order_by('-date')

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
        

class PurchaseReturnDetailApiView(generics.RetrieveAPIView):
    serializer_class = DetailedPurchaseReturnSerializer
    queryset = PurchaseReturn.objects.all()
    permission_classes = [IsAuthenticated, IsUserInOrganisation]

    def get(self, request, *args, **kwargs):
        purchase_return_id = kwargs.get('pk')

        try:
            purchase_return = self.get_object()
            context = self.get_serializer_context()

            date_param = request.query_params.get('date', None)
            if date_param:
                context['date'] = date_param

            serializer = self.get_serializer(purchase_return, context=context)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except PurchaseReturn.DoesNotExist:
            return Response({
                'error': 'Not Found',
                'details': f'The purchase_return of ID {purchase_return_id} does not exist.'
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
        purchase_return_id = kwargs.get('pk')
        try:
            partial = kwargs.pop('partial', True)
            data = request.data.copy()
            instance = self.get_object()
            if request.user != instance.user:
                raise serializers.ValidationError(f"PurchaseReturn {purchase_return_id} can only be edited by user who recorded it")
            serializer = self.get_serializer(instance, data=data, partial=partial)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        except PurchaseReturn.DoesNotExist:
            return Response({
                'error': 'Not Found',
                'details': f'The purchase_return of ID {purchase_return_id} does not exist.'
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
        purchase_return_id = kwargs.get('pk')

        try:
            instance = self.get_object()

            if request.user != instance.user:
                raise serializers.ValidationError(f"Purchase Return {purchase_return_id} can only be deleted by user who recorded it")
        
            purchase = getattr(instance, 'purchase', None)
            if purchase:
                print(f"Purchase associated with instance: {purchase}")

                # Step 2: Get associated bill
                bill = getattr(purchase, 'bill', None)
                if bill:
                    print(f"Bill associated with purchase: {bill}")
                    print(f'Bill initial total amount {bill.total_amount}, amount due {bill.amount_due}')

                    try:
                        # Step 3: Adjust total_amount by adding back the bill amount
                        total_amount = bill.total_amount + instance.bill_amount
                        print(f"Adjusted total amount: {total_amount}")

                        if total_amount < 0:
                            raise serializers.ValidationError(
                                f"Total amount {total_amount} cannot be negative"
                            )

                        # Step 4: Calculate the new amount due
                        amount_due = total_amount - bill.amount_paid
                        print(f"New amount due calculated: {amount_due}")

                        if amount_due < 0:
                            if bill.amount_paid > total_amount:
                                raise serializers.ValidationError(
                                    f"Amount paid {bill.amount_paid} cannot be more than bill total amount {total_amount}"
                                )

                        # Step 5: Update bill fields
                        bill.total_amount = total_amount
                        bill.amount_due = amount_due

                        if bill.amount_paid == total_amount:
                            bill.status = "paid"
                        elif bill.amount_paid == 0:
                            bill.status = "unpaid"
                        else:
                            bill.status = "partially_paid"

                        # Step 6: Save the updated bill
                        bill.save()
                        print(f"Updated bill: {bill}")

                    except Exception as e:
                        print(f"Error during bill update: {str(e)}")
                        raise serializers.ValidationError(f"Error updating bill: {str(e)}")

                else:
                    raise serializers.ValidationError("Purchase has no associated bill")

                # Step 7: Handle return entries if available
                return_entries = instance.return_entries.all()
                if return_entries:
                    print(f"Processing return entries: {return_entries}")
                    for entry in return_entries:
                        purchase_entry = getattr(entry, 'purchase_entry', None)
                        if purchase_entry:
                            purchase_entry.remaining_quantity += entry.return_quantity
                            purchase_entry.save()
                            print(f"Updated purchase entry: {purchase_entry}")
                        else:
                            raise serializers.ValidationError("Return entry has no purchase entry")
                else:
                    raise serializers.ValidationError("Purchase return has no return entries")

            else:
                raise serializers.ValidationError("Purchase return has no associated purchase")

            # Step 8: Delete the instance
            
            instance.delete()
            print(f"Purchase return deleted successfully: {instance}")
            return Response({"detail": "Purchase return deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            raise e
            print(f"Error deleting Purchase Return: {str(e)}")
            raise serializers.ValidationError({"error": f"Error deleting Purchase Return: {str(e)}"})

            return Response({"details": response}, status=status.HTTP_204_NO_CONTENT)
            
        except PurchaseReturn.DoesNotExist:
            return Response({
                'error': 'Not Found',
                'details': f'The purchase_return with ID {purchase_return_id} does not exist.'
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