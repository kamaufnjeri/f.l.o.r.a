from rest_framework import generics, status, serializers
from rest_framework.response import Response
from journals.utils import flatten_errors
from journals.models import Journal
from journals.serializers import JournalSerializer, JournalDetailSerializer
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.pagination import PageNumberPagination
from django.db import models
from datetime import datetime
from journals.utils import date_filtering, sort_filtering
from journals.permissions import IsUserInOrganisation
from rest_framework.permissions import IsAuthenticated
from journals.utils.generate_pdfs import GenerateListsPDF
from django.http import HttpResponse


class JournalPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class JournalFilter(DjangoFilterBackend):
    class Meta:
        model = Journal

    def filter_queryset(self, request, queryset, view):
        try:
            date = request.query_params.get('date')
            sort_by = request.query_params.get('sort_by')

            if date:
                queryset = date_filtering(queryset, date)
        
            
            if sort_by:
                queryset = sort_filtering(queryset, sort_by)

            return queryset

        except Exception as e:
            raise Exception(str(e))


def get_totals(data):
    debit_total = sum(journal.get('journal_entries_total').get("debit_total") for journal in data)
    credit_total = sum(journal.get('journal_entries_total').get("credit_total") for journal in data)

    return debit_total, credit_total



class JournalAPIView(generics.ListCreateAPIView):
    queryset = Journal.objects.all().order_by('created_at')
    serializer_class = JournalSerializer
    pagination_class = JournalPagination
    filter_backends = [JournalFilter, SearchFilter]
    search_fields = ['serial_number', 'description']
    permission_classes = [IsAuthenticated, IsUserInOrganisation]

    def get(self, request, *args, **kwargs):
        try:
            queryset = self.filter_queryset(self.get_queryset().filter(organisation=request.user.current_org))
            paginate = request.query_params.get('paginate')

            if paginate:
                paginator = self.pagination_class()
                paginated_queryset = paginator.paginate_queryset(queryset, request)
                if paginated_queryset is not None:
                    serialized_data = self.get_serializer(paginated_queryset, many=True)
                    debit_total, credit_total = get_totals(serialized_data.data)
                    data = {
                        "journals": serialized_data.data,
                        "totals": {
                            "debit_total": debit_total,
                            "credit_total": credit_total
                        }
                    }
                    return paginator.get_paginated_response({
                    "status": "success",
                    "message": "Journals retrieved successfully with pagination",
                    "data": data
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
        

class DownloadJournalAPIView(generics.ListCreateAPIView):
    queryset = Journal.objects.all().order_by('created_at')
    serializer_class = JournalSerializer
    pagination_class = JournalPagination
    filter_backends = [JournalFilter, SearchFilter]
    search_fields = ['serial_number', 'description']
    permission_classes = [IsAuthenticated, IsUserInOrganisation]


    def post(self, request, *args, **kwargs):
        try:
            queryset = self.filter_queryset(self.get_queryset().filter(organisation=request.user.current_org))

            filter_data = request.query_params.dict()
            title = request.data.get('title')
          
            serializer = self.get_serializer(queryset, many=True)
            debit_total, credit_total = get_totals(serializer.data)
            data = {
                        "journals": serializer.data,
                        "totals": {
                            "debit_total": debit_total,
                            "credit_total": credit_total
                        }
                    }

            pdf_generator = GenerateListsPDF(title, request.user, data, filter_data, filename='journals.html')
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



class JournalDetailAPIView(generics.RetrieveAPIView):
    serializer_class = JournalDetailSerializer
    queryset = Journal.objects.all()
    permission_classes = [IsAuthenticated, IsUserInOrganisation]


    
    def get(self, request, *args, **kwargs):
        journal_id = kwargs.get('pk')

        try:
            journal = self.get_object()
            context = self.get_serializer_context()

            date_param = request.query_params.get('date', None)
            if date_param:
                context['date'] = date_param

            serializer = self.get_serializer(journal, context=context)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Journal.DoesNotExist:
            return Response({
                'error': 'Not Found',
                'details': f'The journal of ID {journal_id} does not exist.'
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
        journal_id = kwargs.get('pk')
        try:
            partial = kwargs.pop('partial', True)
            data = request.data.copy()
            instance = self.get_object()
            if request.user != instance.user:
                raise serializers.ValidationError(f"Journal {journal_id} can only be edited by user who recorded it")
            serializer = self.get_serializer(instance, data=data, partial=partial)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Journal.DoesNotExist:
            return Response({
                'error': 'Not Found',
                'details': f'The journal of ID {journal_id} does not exist.'
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
        journal_id = kwargs.get('pk')

        try:
            instance = self.get_object()

            if request.user != instance.user:
                raise serializers.ValidationError(f"Journal {journal_id} can only be deleted by user who recorded it")
        
            instance.delete() 
            return Response({"detail": "Journal item deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
            
        except Journal.DoesNotExist:
            return Response({
                'error': 'Not Found',
                'details': f'The journal with ID {journal_id} does not exist.'
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


