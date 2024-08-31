from django.urls import path
from .views import SalesAPIView, StockDetailAPIView, AccountCreateAPIView, SalesReturnAPIView
from .views import JournalAPIView, AccountDetailAPIView, StockAPIView, PurchaseAPIView, PurchaseReturnAPIView
from .views import CustomerAPIVew, JournalInvoiceAPIView, CustomerDetailsAPIView, PurchaseBillAPIView
from .views import SupplierAPIVew, SupplierDetailsAPIView, JournalBillAPIView, SalesInvoiceAPIView, PaymentAPIView
from django.urls import path


urlpatterns = [
    path('accounts/', AccountCreateAPIView.as_view(), name="Accounts"),
    path('accounts/<pk>/', AccountDetailAPIView.as_view()),
    path('journals/', JournalAPIView.as_view()),
    path('stocks/', StockAPIView.as_view()),
    path('stocks/<pk>', StockDetailAPIView.as_view()),
    path('purchases/', PurchaseAPIView.as_view()),
    path('sales/', SalesAPIView.as_view()),
    path('purchase_returns/', PurchaseReturnAPIView.as_view()),
    path('sales_returns/', SalesReturnAPIView.as_view()),
    path('customers/', CustomerAPIVew.as_view()),
    path('customers/<pk>/', CustomerDetailsAPIView.as_view()),
    path('suppliers/', SupplierAPIVew.as_view()),
    path('suppliers/<pk>/', SupplierDetailsAPIView.as_view()),
    path('invoices/journals/', JournalInvoiceAPIView.as_view()),
    path('invoices/sales/', SalesInvoiceAPIView.as_view()),
    path('bills/purchases/', PurchaseBillAPIView.as_view()),
    path('bills/journals/', JournalBillAPIView.as_view()),
    path('payments/', PaymentAPIView.as_view())
]