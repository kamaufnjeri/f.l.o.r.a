from rest_framework import generics, status, serializers
from rest_framework.response import Response
from journals.utils import flatten_errors
from journals.models import PurchaseReturn
from journals.serializers import PurchaseReturnSerializer

class PurchaseReturnAPIView(generics.ListCreateAPIView):
    queryset = PurchaseReturn.objects.all()
    serializer_class = PurchaseReturnSerializer

   