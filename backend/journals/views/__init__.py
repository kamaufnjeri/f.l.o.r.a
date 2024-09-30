from .account import AccountAPIView, AccountDetailAPIView
from .bill import PurchaseBillAPIView, JournalBillAPIView
from .customer import CustomerAPIVew, CustomerDetailsAPIView
from .invoice import  SalesInvoiceAPIView, JournalInvoiceAPIView
from .journal import JournalAPIView, JournalDetailAPIView
from .payment import PaymentAPIView
from .purchase import PurchaseAPIView, PurchaseDetailAPIView
from .purchase_return import PurchaseReturnAPIView
from .sales import SalesAPIView, SalesDetailAPIView
from .sales_return import SalesReturnAPIView
from .stock import StockAPIView, StockDetailAPIView
from .supplier import SupplierAPIVew, SupplierDetailsAPIView
from .custom_404 import Custom404APIView
from .serial_number import GetSerialNumberApiView