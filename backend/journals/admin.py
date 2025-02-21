from django.contrib import admin
from .models import Account, Journal, JournalEntries, Stock, PurchaseEntries, PurchaseReturn
from .models import SalesEntries, SalesPurchasePrice, SalesReturn, Sales, Purchase, Customer, Invoice
from .models import PurchaseReturnEntries, SalesReturnEntries, Bill, Supplier, Payment, FloraUser, ServiceIncome, ServiceIncomeEntry
from .models import OrganisationMembership, Organisation, FixedGroup, Category, SubCategory, Service, AuditTrail
# Register your models here.
admin.site.register(Account)
admin.site.register(Stock)
admin.site.register(Customer)
admin.site.register(Invoice)
admin.site.register(Supplier)
admin.site.register(Bill)
admin.site.register(Payment)
admin.site.register(Journal)
admin.site.register(JournalEntries)
admin.site.register(Purchase)
admin.site.register(PurchaseReturn)
admin.site.register(PurchaseReturnEntries)
admin.site.register(PurchaseEntries)
admin.site.register(Sales)
admin.site.register(SalesReturn)
admin.site.register(SalesReturnEntries)
admin.site.register(SalesEntries)
admin.site.register(SalesPurchasePrice)
admin.site.register(FloraUser)
admin.site.register(Organisation)
admin.site.register(OrganisationMembership)
admin.site.register(Category)
admin.site.register(SubCategory)
admin.site.register(FixedGroup)
admin.site.register(Service)
admin.site.register(ServiceIncome)
admin.site.register(ServiceIncomeEntry)
admin.site.register(AuditTrail)