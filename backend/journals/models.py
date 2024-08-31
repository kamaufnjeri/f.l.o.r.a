from django.db import models
from .variables import GROUPS, CATEGORIES, SUB_CATEGORIES

# Create your models here.
class Account(models.Model):


    OPENING_BALANCE = (
        ("debit", "Debit"),
        ("credit", "Credit")
    )
    name = models.CharField(max_length=200)
    group = models.CharField(max_length=200, choices=GROUPS)
    category = models.CharField(max_length=200, choices=CATEGORIES)
    sub_category = models.CharField(max_length=200, choices=SUB_CATEGORIES)
    opening_balance = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    opening_balance_type = models.CharField(max_length=200, blank=True, null=True, choices=OPENING_BALANCE)

    def __str__(self):
        return self.name

class Journal(models.Model):
    date = models.DateField()
    description = models.TextField()

    def __str__(self):
        return self.description
    
class Purchase(models.Model):
    date = models.DateField()
    description = models.TextField()

    def __str__(self):
        return self.description
    
class Sales(models.Model):
    date = models.DateField()
    description = models.TextField()


    def __str__(self):
        return self.description
      
class Discount(models.Model):
    DISCOUNT_TYPES = (
        ('purchase', 'Purchase'),
        ('sales', 'Sales')
    )
    discount_type = models.CharField(max_length=120, choices=DISCOUNT_TYPES)
    purchase = models.OneToOneField(Purchase, related_name='discount_received', on_delete=models.CASCADE, null=True, blank=True)
    sales = models.OneToOneField(Sales, related_name='discount_allowed', on_delete=models.CASCADE, null=True, blank=True)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=15, decimal_places=2)

    
class PurchaseReturn(models.Model):
    date = models.DateField()
    description = models.TextField()
    account = models.ForeignKey(Account, related_name='purchase_return', on_delete=models.CASCADE)
    purchase = models.ForeignKey(Purchase, related_name='purchase_return', on_delete=models.CASCADE)

    def __str__(self):
        return self.description
    
class SalesReturn(models.Model):
    date = models.DateField()
    description = models.TextField()
    account = models.ForeignKey(Account, related_name='sales_return', on_delete=models.CASCADE)
    sales = models.ForeignKey(Sales, related_name='sales_return', on_delete=models.CASCADE)


    def __str__(self):
        return self.description
 
class Customer(models.Model):
    name = models.CharField(max_length=200)
    email = models.EmailField()
    phone_number = models.IntegerField()
    account = models.OneToOneField(Account, related_name="customer", null=True, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

class Supplier(models.Model):
    name = models.CharField(max_length=200)
    email = models.EmailField()
    phone_number = models.IntegerField()
    account = models.OneToOneField(Account, related_name="supplier", null=True, on_delete=models.CASCADE)


    def __str__(self):
        return self.name

STATUS = (
    ("paid", "Paid"),
    ("partially_paid", "Partially_paid"),
    ("unpaid", "Unpaid")
)


class Invoice(models.Model):
    journal = models.OneToOneField(Journal, related_name='invoice', blank=True, null=True, on_delete=models.CASCADE)
    sales = models.OneToOneField(Sales, related_name='invoice', blank=True, null=True, on_delete=models.CASCADE)
    status = models.CharField(max_length=200, choices=STATUS)
    due_date = models.DateField()
    total_amount = models.DecimalField(max_digits=15, decimal_places=2)
    amount_due = models.DecimalField(max_digits=15, decimal_places=2)
    amount_paid = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    customer = models.ForeignKey(Customer, related_name='invoice', on_delete=models.CASCADE)

class Bill(models.Model):
    journal = models.OneToOneField(Journal, related_name='bill', blank=True, null=True, on_delete=models.CASCADE)
    purchase = models.OneToOneField(Purchase, related_name='bill', blank=True, null=True, on_delete=models.CASCADE)
    status = models.CharField(max_length=200, choices=STATUS)
    due_date = models.DateField()
    total_amount = models.DecimalField(max_digits=15, decimal_places=2)
    amount_due = models.DecimalField(max_digits=15, decimal_places=2)
    amount_paid = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    supplier = models.ForeignKey(Supplier, related_name='bill', on_delete=models.CASCADE)

class Payment(models.Model):
    invoice = models.ForeignKey(Invoice, related_name="payment", null=True, blank=True, on_delete=models.CASCADE)
    bill = models.ForeignKey(Bill, related_name="payment", null=True, blank=True, on_delete=models.CASCADE)
    date = models.DateField()
    description = models.TextField()
    amount_paid = models.DecimalField(max_digits=15, decimal_places=2)


class JournalEntries(models.Model):
    DEBIT_CREDIT = (
        ("debit", "Debit"),
        ("credit", "Credit")
    )
    amount = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    debit_credit = models.CharField(max_length=200, choices=DEBIT_CREDIT)
    account = models.ForeignKey(Account, related_name='journal_entries', on_delete=models.CASCADE)
    journal = models.ForeignKey(Journal, related_name='journal_entries', on_delete=models.CASCADE, blank=True, null=True)
    purchase = models.ForeignKey(Purchase, related_name='journal_entries', on_delete=models.CASCADE, blank=True, null=True)
    sales = models.ForeignKey(Sales, related_name='journal_entries', on_delete=models.CASCADE, blank=True, null=True)
    purchase_return = models.ForeignKey(PurchaseReturn, related_name='journal_entries', on_delete=models.CASCADE, blank=True, null=True)
    sales_return = models.ForeignKey(SalesReturn, related_name='journal_entries', on_delete=models.CASCADE, blank=True, null=True)
    payments = models.ForeignKey(Payment, related_name="journal_entries", on_delete=models.CASCADE, blank=True, null=True)

    def __str__(self):
        return self.debit_credit

class Stock(models.Model):
    name = models.CharField(max_length=200)
    unit_name = models.CharField(max_length=200)
    unit_alias = models.CharField(max_length=200)
    opening_stock_quantity = models.IntegerField(blank=True, default=0)
    opening_stock_rate = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    def __str__(self):
        return self.name
 
class PurchaseEntries(models.Model):
    purchase = models.ForeignKey(Purchase, related_name='purchase_entries', on_delete=models.CASCADE)
    stock = models.ForeignKey(Stock, related_name='purchase_entries', on_delete=models.CASCADE)
    purchased_quantity = models.IntegerField()
    remaining_quantity = models.IntegerField()
    purchase_price = models.DecimalField(max_digits=15, decimal_places=2)
    cogs = models.DecimalField(max_digits=15, decimal_places=2)

    def __str__(self):
        return self.stock.name

class SalesEntries(models.Model):
    sales = models.ForeignKey(Sales, related_name='sales_entries', on_delete=models.CASCADE)
    stock = models.ForeignKey(Stock, related_name='sales_entries', on_delete=models.CASCADE)
    initial_quantity = models.IntegerField()
    sold_quantity = models.IntegerField()
    sales_price = models.DecimalField(max_digits=15, decimal_places=2)
    cogs = models.DecimalField(max_digits=15, decimal_places=2, default=0)

    def __str__(self):
        return self.stock.name
    
class PurchaseReturnEntries(models.Model):
    purchase_return = models.ForeignKey(PurchaseReturn, related_name='return_entries', on_delete=models.CASCADE)
    purchase_entry = models.ForeignKey(PurchaseEntries, related_name='return_entries', on_delete=models.CASCADE)
    return_quantity = models.IntegerField()
    purchase_price = models.DecimalField(max_digits=15, decimal_places=2)
    cogs = models.DecimalField(max_digits=15, decimal_places=2)

class SalesReturnEntries(models.Model):
    sales_return = models.ForeignKey(SalesReturn, related_name='return_entries', on_delete=models.CASCADE)
    sales_entry = models.ForeignKey(SalesEntries, related_name='return_entries', on_delete=models.CASCADE)
    return_quantity = models.IntegerField()
    sales_price = models.DecimalField(max_digits=15, decimal_places=2)
    cogs = models.DecimalField(max_digits=15, decimal_places=2)

class SalesPurchasePrice(models.Model):
    purchase_price = models.DecimalField(max_digits=15, decimal_places=2)
    sales_price =models.DecimalField(max_digits=15, decimal_places=2)
    initial_quantity = models.IntegerField()
    sold_quantity = models.IntegerField()
    purchase_entry = models.ForeignKey(PurchaseEntries, related_name='sales_purchases_price', on_delete=models.CASCADE)
    sales_entry = models.ForeignKey(SalesEntries, related_name="sales_purchase_price", on_delete=models.CASCADE)
  