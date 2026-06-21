from rest_framework import generics, status, serializers
from rest_framework.response import Response
from journals.utils import flatten_errors
from journals.utils.select_options_utils import select_options
from journals.models import Account, Supplier, Customer, Stock, SubCategory, Category, FixedGroup, Service
from rest_framework.permissions import IsAuthenticated
from journals.permissions import IsUserInOrganisation


class SelectOptionsAPIView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, IsUserInOrganisation]

    def get(self, request, *args, **kwargs):
        try:
            organisation = request.user.current_org

            response_data = select_options.get_select_options(organisation)

            return Response(response_data, status=status.HTTP_200_OK)
        
        except serializers.ValidationError as e:
            errors = flatten_errors(e.detail)
            return Response({
                'error': 'Bad Request',
                'details': errors
            }, status=status.HTTP_400_BAD_REQUEST)
       