from rest_framework import generics, status, serializers
from rest_framework.response import Response
from journals.utils import flatten_errors
from journals.models import Supplier
from journals.serializers import SupplierSerializer, SupplierDetailSerializer
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.pagination import PageNumberPagination
from journals.permissions import IsUserInOrganisation
from rest_framework.permissions import IsAuthenticated
from journals.utils.generate_pdfs import GenerateListsPDF
from django.http import HttpResponse


class SupplierPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class SupplierAPIVew(generics.ListCreateAPIView):
    queryset = Supplier.objects.all().order_by('created_at')
    serializer_class = SupplierSerializer
    pagination_class = SupplierPagination
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
                    serialized_data = self.get_serializer(paginated_queryset, many=True)
                    return paginator.get_paginated_response({
                    "status": "success",
                    "message": "Suppliers retrieved successfully with pagination",
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


class DownloadSupplierAPIVew(generics.ListCreateAPIView):
    queryset = Supplier.objects.all().order_by('created_at')
    serializer_class = SupplierSerializer
    pagination_class = SupplierPagination
    permission_classes = [IsAuthenticated, IsUserInOrganisation]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    search_fields = ['name']

    def post(self, request, *args, **kwargs):
        try:
            queryset = self.filter_queryset(self.get_queryset().filter(organisation=request.user.current_org))

            filter_data = request.query_params.dict()
            title = request.data.get('title')
          
            serializer = self.get_serializer(queryset, many=True)

            pdf_generator = GenerateListsPDF(title, request.user, serializer.data, filter_data, filename='users.html')
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
        

class SupplierDetailsAPIView(generics.RetrieveAPIView):
    queryset = Supplier.objects.all()
    serializer_class = SupplierDetailSerializer
    permission_classes = [IsAuthenticated, IsUserInOrganisation]

    def get(self, request, *args, **kwargs):
        supplier_id = kwargs.get('pk')

        try:
            supplier = self.get_object()
            context = self.get_serializer_context()

            date_param = request.query_params.get('date', None)
            if date_param:
                context['date'] = date_param

            serializer = self.get_serializer(supplier, context=context)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Supplier.DoesNotExist:
            return Response({
                'error': 'Not Found',
                'details': f'The supplier of ID {supplier_id} does not exist.'
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
        supplier_id = kwargs.get('pk')
        try:
            partial = kwargs.pop('partial', True)
            data = request.data.copy()
            data['organisation'] = kwargs.get('organisation_id')
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=data, partial=partial)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Supplier.DoesNotExist:
            return Response({
                'error': 'Not Found',
                'details': f'The supplier of ID {supplier_id} does not exist.'
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
        supplier_id = kwargs.get('pk')

        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)

            has_entries = False
            
            totals = serializer.data.get('supplier_data', {}).get('totals', {})
            amount_paid = totals.get('amount_paid')
            amount_due = totals.get('amount_due')

            print(totals)

            if amount_paid > 0 or amount_due > 0:
                has_entries = True

            if not has_entries:
                instance.delete() 
                return Response({"detail": "Supplier item deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
            else:
                raise serializers.ValidationError("Cannot delete supplier with associated bills.")

        except Supplier.DoesNotExist:
            return Response({
                'error': 'Not Found',
                'details': f'The supplier with ID {supplier_id} does not exist.'
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


class DownloadSupplierDetailAPIView(generics.RetrieveAPIView):
    queryset = Supplier.objects.all()
    serializer_class = SupplierDetailSerializer
    permission_classes = [IsAuthenticated, IsUserInOrganisation]


    def post(self, request, *args, **kwargs):
        supplier_id = kwargs.get('pk')

        try:
            supplier = self.get_object()
            context = self.get_serializer_context()
            title = request.data.get('title')


            filter_data = request.query_params.dict()
            date_param = filter_data.get('date', None)
            if date_param:
                context['date'] = date_param

            serializer = self.serializer_class(supplier, context=context)


            pdf_generator = GenerateListsPDF(title, request.user, serializer.data, filter_data, filename='single_supplier.html')
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
