from rest_framework import generics, serializers, status
from journals.models import Service, ServiceIncome
from journals.serializers import ServiceSerializer, ServiceIncomeSerializer, ServiceIncomeDetailSerializer, ServiceDetailSerializer
from rest_framework.response import Response
from journals.utils import flatten_errors
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.pagination import PageNumberPagination
from journals.permissions import IsUserInOrganisation
from rest_framework.permissions import IsAuthenticated
from journals.utils import flatten_errors, date_filtering, sort_filtering
from journals.utils.generate_pdfs import GenerateListsPDF
from django.http import HttpResponse


class ServicePagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class ServiceAPIView(generics.ListCreateAPIView):
    queryset = Service.objects.all().order_by('created_at')
    serializer_class = ServiceSerializer
    pagination_class = ServicePagination
    permission_classes = [IsAuthenticated, IsUserInOrganisation]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    search_fields = ['name', 'description']

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
                    "message": "Services retrieved successfully with pagination",
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



class DownloadServiceAPIView(generics.ListCreateAPIView):
    queryset = Service.objects.all().order_by('created_at')
    serializer_class = ServiceSerializer
    pagination_class = ServicePagination
    permission_classes = [IsAuthenticated, IsUserInOrganisation]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    search_fields = ['name', 'description']

    def post(self, request, *args, **kwargs):
        try:
            queryset = self.filter_queryset(self.get_queryset().filter(organisation=request.user.current_org))

            filter_data = request.query_params.dict()
            title = request.data.get('title')
          
            serializer = self.get_serializer(queryset, many=True)

            pdf_generator = GenerateListsPDF(title, request.user, serializer.data, filter_data, filename='services.html')
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
        

class ServiceDetailAPIView(generics.RetrieveAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceDetailSerializer
    permission_classes = [IsAuthenticated, IsUserInOrganisation]


    def get(self, request, *args, **kwargs):
        service_id = kwargs.get('pk')

        try:
            service =self.get_object()
            context = self.get_serializer_context()

            date_param = request.query_params.get('date', None)
            if date_param:
                context['date'] = date_param

            serializer = self.serializer_class(service, context=context)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Service.DoesNotExist:
            return Response({
                'error': 'Not Found',
                'details': f'The service of ID {service_id} does not exist.'
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
        service_id = kwargs.get('pk')
        try:
            partial = kwargs.pop('partial', True)
            data = request.data.copy()
            data['organisation'] = kwargs.get('organisation_id')
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=data, partial=partial)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Service.DoesNotExist:
            return Response({
                'error': 'Not Found',
                'details': f'The service of ID {service_id} does not exist.'
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
        service_id = kwargs.get('pk')

        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)

            has_entries = False
            
            total_amount = serializer.data.get('service_data', {}).get('total', [])
               
            if total_amount > 0:
                has_entries = True

            if not has_entries:
                #instance.delete() 
                return Response({"detail": "Service item deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
            else:
                raise serializers.ValidationError("Cannot delete service with associated entries.")

        except Service.DoesNotExist:
            return Response({
                'error': 'Not Found',
                'details': f'The service with ID {service_id} does not exist.'
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



class DownloadServiceDetailAPIView(generics.RetrieveAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceDetailSerializer
    permission_classes = [IsAuthenticated, IsUserInOrganisation]


    def post(self, request, *args, **kwargs):
        service_id = kwargs.get('pk')

        try:
            service = self.get_object()
            context = self.get_serializer_context()
            title = request.data.get('title')


            filter_data = request.query_params.dict()
            date_param = filter_data.get('date', None)
            if date_param:
                context['date'] = date_param

            serializer = self.serializer_class(service, context=context)


            pdf_generator = GenerateListsPDF(title, request.user, serializer.data, filter_data, filename='single_service.html')
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
        
class ServiceIncomePagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class ServiceIncomeFilter(DjangoFilterBackend):
    class Meta:
        model = ServiceIncome

    def filter_queryset(self, request, queryset, view):
        try:
            service_income = request.query_params.get('service_income')
            date = request.query_params.get('date')
            sort_by = request.query_params.get('sort_by')

            if date:
                queryset = date_filtering(queryset, date)
            
            if service_income:
                if service_income == "is_invoices":
                    queryset = queryset.filter(invoice__isnull=False)
                elif service_income == "is_not_invoices":
                    queryset = queryset.filter(invoice__isnull=True)
                elif service_income == "all":
                    queryset = queryset.all()
                else:
                    raise Exception("Valid options for service_income are 'is_invoices' or 'is_not_invoices' or 'all'")
            else:
                queryset = queryset.all()

            if sort_by:
                queryset = sort_filtering(queryset, sort_by)
            return queryset

        except Exception as e:
            raise Exception(str(e))


class ServiceIncomeAPIView(generics.ListCreateAPIView):
    queryset = ServiceIncome.objects.all().order_by('created_at')
    serializer_class = ServiceIncomeSerializer
    pagination_class = ServiceIncomePagination
    permission_classes = [IsAuthenticated, IsUserInOrganisation]
    filter_backends = [ServiceIncomeFilter, SearchFilter]
    search_fields = ['serial_number', 'description']

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
                    "message": "Service Income retrieved successfully with pagination",
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
        

class DownloadServiceIncomeAPIView(generics.ListCreateAPIView):
    queryset = ServiceIncome.objects.all().order_by('created_at')
    serializer_class = ServiceIncomeSerializer
    pagination_class = ServiceIncomePagination
    permission_classes = [IsAuthenticated, IsUserInOrganisation]
    filter_backends = [ServiceIncomeFilter, SearchFilter]
    search_fields = ['serial_number', 'description']    

    def post(self, request, *args, **kwargs):
        try:
            queryset = self.filter_queryset(self.get_queryset().filter(organisation=request.user.current_org))

            filter_data = request.query_params.dict()
            title = request.data.get('title')
          
            serializer = self.get_serializer(queryset, many=True)

            pdf_generator = GenerateListsPDF(title, request.user, serializer.data, filter_data, filename='service_income.html')
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


class ServiceIncomeDetailAPIView(generics.RetrieveAPIView):
    serializer_class = ServiceIncomeDetailSerializer
    queryset = ServiceIncome.objects.all()