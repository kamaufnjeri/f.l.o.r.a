from rest_framework import generics, status, serializers
from rest_framework.response import Response
from journals.serializers import AccountSerializer, AccountDetailsSerializer
from journals.utils import flatten_errors
from journals.constants import ACCOUNT_STRUCTURE, SUB_CATEGORIES
from django.db.models import Q
from journals.models import Account, Organisation, OrganisationMembership
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from journals.permissions import IsUserInOrganisation


class AccountPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class AccountAPIView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated, IsUserInOrganisation]
    queryset = Account.objects.all().order_by('created_at')
    serializer_class = AccountSerializer
    pagination_class = AccountPagination
    filter_backends = [DjangoFilterBackend, SearchFilter]
    search_fields = ['name', 'group', 'category', 'sub_category']
    filterset_fields = ['name', 'group', 'category', 'sub_category']



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


class AccountDetailAPIView(generics.RetrieveAPIView):
    queryset = Account.objects.all()
    serializer_class = AccountDetailsSerializer
    permission_classes = [IsAuthenticated, IsUserInOrganisation]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['to_date'] = self.request.query_params.get('to_date')
        return context

    def get(self, request, *args, **kwargs):
        account_id = kwargs.get('pk')

        try:
            account = Account.objects.get(id=account_id)
            serializer = self.serializer_class(account, context=self.get_serializer_context())
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Account.DoesNotExist:
            return Response({
                'error': 'Not Found',
                'details': f'The account of ID {account_id} does not exist.'
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
