from django.shortcuts import render
from rest_framework import generics, views
from django.db.models import Q
from django.utils import timezone
from .models import Account, Journal, Stock, Sales, Purchase, PurchaseReturn, SalesReturn
from .models import Customer, Journal, Supplier, Payment
from .serializers import SalesSerializer, AccountSerializer, StockDetailsSerializer, SupplierSerializer
from .serializers import JournalSerializer, AccountDetailsSerializer, StockSerializer, JournalBillSerializer
from .serializers import PurchaseSerializer, PurchaseReturnSerializer, SalesReturnSerializer, PaymentSerializer
from .serializers import CustomerSerializer, JournalInvoiceSerializer, PurchaseBillSerializer, SalesInvoiceSerializer


# Create your views here.

class AccountCreateAPIView(generics.ListCreateAPIView):
    serializer_class = AccountSerializer

    def get_queryset(self):
        queryset = Account.objects.all()

        sub_category = self.request.query_params.get('sub_category')
        group = self.request.query_params.get('group')
        if sub_category:
            sub_category_cleaned = sub_category.strip().replace('"', '').replace("'", "")
            queryset = queryset.filter(
                Q(sub_category__icontains=sub_category_cleaned)
            )
        if group:
            group_cleaned = group.strip().replace('"', '').replace("'", "")
            queryset = queryset.filter(
                Q(group__icontains=group_cleaned)
            )

        return queryset


class AccountDetailAPIView(generics.RetrieveAPIView):
    queryset = Account.objects.all()
    serializer_class = AccountDetailsSerializer

   
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['to_date'] = self.request.query_params.get('to_date')
        return context

class JournalAPIView(generics.ListCreateAPIView):
    queryset = Journal.objects.all()
    serializer_class = JournalSerializer

    
class StockAPIView(generics.ListCreateAPIView):
    queryset = Stock.objects.all()
    serializer_class = StockSerializer

class StockDetailAPIView(generics.RetrieveAPIView):
    queryset = Stock.objects.all()
    serializer_class = StockDetailsSerializer

class PurchaseAPIView(generics.ListCreateAPIView):
    queryset = Purchase.objects.all()
    serializer_class = PurchaseSerializer

class PurchaseReturnAPIView(generics.ListCreateAPIView):
    queryset = PurchaseReturn.objects.all()
    serializer_class = PurchaseReturnSerializer


class SalesAPIView(generics.ListCreateAPIView):
    queryset = Sales.objects.all()
    serializer_class = SalesSerializer

class SalesReturnAPIView(generics.ListCreateAPIView):
    queryset = SalesReturn.objects.all()
    serializer_class = SalesReturnSerializer

class CustomerAPIVew(generics.ListCreateAPIView):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer

class CustomerDetailsAPIView(generics.RetrieveAPIView):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer

class SupplierAPIVew(generics.ListCreateAPIView):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer

class SupplierDetailsAPIView(generics.RetrieveAPIView):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer



class JournalInvoiceAPIView(generics.ListCreateAPIView):
    queryset = Journal.objects.filter(invoice__isnull=False)
    serializer_class = JournalInvoiceSerializer

class SalesInvoiceAPIView(generics.ListCreateAPIView):
    queryset = Sales.objects.filter(invoice__isnull=False)
    serializer_class = SalesInvoiceSerializer

class PurchaseBillAPIView(generics.ListCreateAPIView):
    queryset = Purchase.objects.filter(bill__isnull=False)
    serializer_class = PurchaseBillSerializer

class JournalBillAPIView(generics.ListCreateAPIView):
    queryset = Journal.objects.filter(bill__isnull=False)
    serializer_class = JournalBillSerializer


class PaymentAPIView(generics.ListCreateAPIView):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer