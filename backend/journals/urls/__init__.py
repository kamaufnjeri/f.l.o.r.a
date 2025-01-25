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
from .select_options import urlpatterns as select_options_urls
from .organisation import urlpatterns as organisations_urls
from .generate_pdf import urlpatterns as generatepdfurls
from .service import urlpatterns as service_urls
from .service_income import urlpatterns as service_income_urls
from .audit_trail import urlpatterns as audit_trails_urls

urlpatterns = [
    path('auth/', include(auth_urls)),
    path('<organisation_id>/accounts/', include(account_urls)),
    path('<organisation_id>/bills/', include(bill_urls)),
    path('<organisation_id>/customers/', include(customer_urls)),
    path('<organisation_id>/invoices/', include(invoice_urls)),
    path('<organisation_id>/journals/', include(journal_urls)),
    path('<organisation_id>/payments/', include(payment_urls)),
    path('<organisation_id>/purchases/', include(purchase_urls)),
    path('<organisation_id>/purchase_returns/', include(purchase_return_urls)),
    path('<organisation_id>/sales/', include(sales_urls)),
    path('<organisation_id>/sales_returns/', include(sales_return_urls)),
    path('<organisation_id>/suppliers/', include(supplier_urls)),
    path('<organisation_id>/stocks/', include(stock_urls)),
    path('<organisation_id>/select_options/', include(select_options_urls)),
    path('<organisation_id>/', include(generatepdfurls)),
    path('organisations/', include(organisations_urls)),
    path('<organisation_id>/services/', include(service_urls)),
    path('<organisation_id>/service_income/', include(service_income_urls)),
    path('audit_trails/', include(audit_trails_urls)),
    path('', include(custom_404)),

]
