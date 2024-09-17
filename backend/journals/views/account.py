from rest_framework import generics, status, serializers
from rest_framework.response import Response
from journals.serializers import AccountSerializer, AccountDetailsSerializer
from journals.utils import flatten_errors
from journals.constants import ACCOUNT_STRUCTURE, SUB_CATEGORIES
from django.db.models import Q
from journals.models import Account

class AccountAPIView(generics.ListCreateAPIView):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        sub_category = self.request.query_params.get('sub_category')
        group = self.request.query_params.get('group')

        if group:
            group_cleaned = group.strip().replace('"', '').replace("'", "")
            if group_cleaned not in ACCOUNT_STRUCTURE:
                raise serializers.ValidationError(f'Group "{group_cleaned}" is not valid. Valid groups are: {", ".join(ACCOUNT_STRUCTURE.keys())}')
            queryset = queryset.filter(Q(group__icontains=group_cleaned))

        if sub_category:
            sub_category_cleaned = sub_category.strip().replace('"', '').replace("'", "")
            if sub_category_cleaned not in dict(SUB_CATEGORIES):
                raise serializers.ValidationError(f'Sub category "{sub_category_cleaned}" is not valid. Valid sub categories are: {", ".join(dict(SUB_CATEGORIES).keys())}')
            queryset = queryset.filter(Q(sub_category__icontains=sub_category_cleaned))

        return queryset
    
    def get(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()
            serializer = self.serializer_class(queryset, many=True)
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


class AccountDetailAPIView(generics.RetrieveAPIView):
    queryset = Account.objects.all()
    serializer_class = AccountDetailsSerializer

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
