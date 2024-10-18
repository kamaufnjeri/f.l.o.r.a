from django.urls import path, include

# Import URL patterns from each module
from .bill import urlpatterns as bill_urls
from .customer import urlpatterns as customer_urls
from .invoice import urlpatterns as invoice_urls
from .account import urlpatterns as account_urls
from .journal import urlpatterns as journal_urls
from .payment import urlpatterns as payment_urls
from .purchase import urlpatterns as purchase_urls
from .purchase_return import urlpatterns as purchase_return_urls
from .sales import urlpatterns as sales_urls
from .sales_return import urlpatterns as sales_return_urls
from .supplier import urlpatterns as supplier_urls
from .stock import urlpatterns as stock_urls
from .custom_404 import urlpatterns as cutom_404_urls
from .auth import urlpatterns as auth_urls
from .get_serial_number import urlpatterns as serial_number_urls
from .organisation import urlpatterns as organisations_urls


urlpatterns = [
    path('auth/', include(auth_urls)),
    path('accounts/', include(account_urls)),
    path('bills/', include(bill_urls)),
    path('customers/', include(customer_urls)),
    path('invoices/', include(invoice_urls)),
    path('journals/', include(journal_urls)),
    path('payments/', include(payment_urls)),
    path('purchases/', include(purchase_urls)),
    path('purchase_returns/', include(purchase_return_urls)),
    path('sales/', include(sales_urls)),
    path('sales_returns/', include(sales_return_urls)),
    path('suppliers/', include(supplier_urls)),
    path('stocks/', include(stock_urls)),
    path('serial_number/', include(serial_number_urls)),
    path('organisations/', include(organisations_urls)),
    path('', include(custom_404)),

]
