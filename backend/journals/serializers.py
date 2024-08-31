from rest_framework import serializers
from django.utils import timezone
import decimal
from datetime import date
from django.db import transaction, models
from .variables import ACCOUNT_STRUCTURE
from .models import Bill, Invoice, Supplier, Discount
from .models import SalesEntries, Journal, JournalEntries, Account, Stock, PurchaseEntries, Customer, Payment
from .models import Sales, Purchase, SalesReturnEntries, PurchaseReturnEntries, PurchaseReturn, SalesReturn
from .utils import journal_entries_dict, validate_sales_entries, create_sales_entries
from .utils import create_purchase_return_entries, validate_purchase_return_entries
from .utils import create_journal_entries, create_purchase_entries, validate_journal_entries
from .utils import validate_purchase_entries, validate_double_entry, validate_sales_return_entries
from .utils import create_sales_return_entries, create_journal_entry

class JournalEntrySerializer(serializers.ModelSerializer):
    account = serializers.CharField(write_only=True)
    journal = serializers.CharField(write_only=True, required=False)
    id = serializers.CharField(read_only=True)
    account_name = serializers.SerializerMethodField(read_only=True)
    class Meta:
        fields = ["account", "journal", "id", "amount", "debit_credit", "account_name"]
        model = JournalEntries

    def get_account_name(self, obj):
        return obj.account.name

class AccountSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)

    class Meta:
        fields = ['id', 'name', 'group', 'category', 'sub_category', 'opening_balance', 'opening_balance_type']
        required_fields = ['name', 'category', 'sub_category']
        model = Account

    def validate(self, data):
        group = data.get('group')
        category = data.get('category')
        sub_category = data.get('sub_category')

        if group not in ACCOUNT_STRUCTURE:
            raise serializers.ValidationError(f'Group "{group}" is not valid. Valid groups are: {", ".join(ACCOUNT_STRUCTURE.keys())}')
        
        categories = ACCOUNT_STRUCTURE[group]
        if category not in categories:
            raise serializers.ValidationError(
                f'Category "{category}" under group "{group}" is not valid. Valid categories are: {", ".join(categories.keys())}'
            )
        
        sub_categories = categories[category]
        
        if sub_category not in sub_categories:
            raise serializers.ValidationError(
                f'Subcategory "{sub_category}" under category "{category}" is not valid. Valid subcategories are: {", ".join(sub_categories)}'
            )
        
        opening_balance_type = ['debit', 'credit']
        
        if data.get('opening_balance_type') and data.get('opening_balance_type') not in opening_balance_type:
            raise serializers.ValidationError(f'Opening balance type can only be: {" and ".join(opening_balance_type)}')
        
        if (data.get('opening_balance') and not data.get('opening_balance_type')) or (
            data.get('opening_balance_type') and not data.get('opening_balance')
        ):
            raise serializers.ValidationError(
                f'If account has opening balance opening balance type must be given'
            )
        return data
    


class AccountDetailsSerializer(AccountSerializer):
    account_balance = serializers.SerializerMethodField(read_only=True)
    journal_entries = JournalEntrySerializer(many=True)

    class Meta:
        model = Account
        fields = AccountSerializer.Meta.fields + ['account_balance', 'journal_entries']


    def get_account_balance(self, obj):
        to_date = self.context.get('to_date', None)
        
        if to_date:
            journal_entries = JournalEntries.objects.filter(
                models.Q(account=obj) &
                models.Q(
                    models.Q(journal__date__lte=to_date) |
                    models.Q(sales__date__lte=to_date) |
                    models.Q(purchase__date__lte=to_date) |
                    models.Q(purchase_return__date__lte=to_date) |
                    models.Q(sales_return__date__lte=to_date)
                )
            )
        else:
            journal_entries = JournalEntries.objects.filter(account=obj)
        
        debit_total = sum(entry.amount for entry in journal_entries if entry.debit_credit == 'debit')
        credit_total = sum(entry.amount for entry in journal_entries if entry.debit_credit == 'credit')

        if obj.opening_balance and obj.opening_balance_type:
            if obj.opening_balance_type == 'debit':
                debit_total += obj.opening_balance
            else:
                credit_total += obj.opening_balance
        
        if obj.group in ('asset', 'expense'):
            return debit_total - credit_total
        else:
            return credit_total - debit_total  

class JournalSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    journal_entries = JournalEntrySerializer(many=True)

    class Meta:
        fields = ['id', "date", "description", "journal_entries"]
        model = Journal
    
    def validate(self, data):
        journal_entries = data.get('journal_entries')
        validate_journal_entries(journal_entries)
        validate_double_entry(journal_entries)
        return data
    

    def create(self, validated_data):
        with transaction.atomic():
            journal_entries_data = validated_data.pop('journal_entries')
            journal = Journal.objects.create(**validated_data)

            create_journal_entries(journal_entries_data, "journal", journal, AccountDetailsSerializer)

        return journal


class PurchaseEntriesSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    stock = serializers.CharField(write_only=True)
    purchase = serializers.CharField(write_only=True, required=False)
    remaining_quantity = serializers.IntegerField(read_only=True)
    cogs = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    stock_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = PurchaseEntries
        fields = '__all__'

    def get_stock_name(self, obj):
        return obj.stock.name
class DiscountSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    discount_type = serializers.CharField(read_only=True)
    class Meta:
        model = Discount
        fields = ['id', 'discount_type', 'discount_percentage', 'discount_amount']

class PurchaseSerializer(serializers.ModelSerializer):

    id = serializers.CharField(read_only=True)
    purchase_entries = PurchaseEntriesSerializer(many=True)
    journal_entries = JournalEntrySerializer(many=True)
    discount_received = DiscountSerializer(allow_null=True, required=False)
 
    class Meta:
        model = Purchase
        fields = ['id', 'date', 'description', 'purchase_entries', 'journal_entries', 'discount_received']

    def validate(self, data):
        purchase_entries = data.get('purchase_entries')
        journal_entries = data.get('journal_entries')

        validate_purchase_entries(purchase_entries)
        validate_journal_entries(journal_entries)

        return data
    
    def create(self, validated_data):
        with transaction.atomic():
            purchase_entries_data = validated_data.pop('purchase_entries')
            journal_entries = validated_data.pop('journal_entries')
            discount_received = validated_data.pop('discount_received', None)
            purchase = Purchase.objects.create(**validated_data)
            cogs = create_purchase_entries(purchase_entries_data, purchase)
            try:
                inventory_account = Account.objects.get(name="Inventory")
            except Account.DoesNotExist:
                raise serializers.ValidationError('Inventory Account not found')
            if discount_received.get('discount_amount') > 0.00 and discount_received.get('discount_percentage') > 0.00:
                discount = Discount.objects.create(purchase=purchase, discount_type='purchase', **discount_received)
                try:
                    discount_account = Account.objects.get(name='Discount received')
                except Account.DoesNotExist:
                    raise serializers.ValidationError('Discount received account not found')
                discount_account_data = create_journal_entry(discount_account, discount.discount_amount, 'credit')
                journal_entries.append(discount_account_data)
            inventory_account_data = create_journal_entry(inventory_account, cogs, "debit")
            journal_entries.append(inventory_account_data)
            validate_double_entry(journal_entries)
            create_journal_entries(journal_entries, "purchase", purchase, AccountDetailsSerializer)

        return purchase
    
class StockSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    opening_stock_rate = serializers.DecimalField(max_digits=15, decimal_places=2, required=False)
    opening_stock_quantity = serializers.IntegerField(required=False)

    class Meta:
        model = Stock
        fields = ['id', 'name', 'unit_name', 'unit_alias', 'opening_stock_quantity', 'opening_stock_rate']
    def create(self, validated_data):
        with transaction.atomic():
            try:
                opening_stock_account = Account.objects.get(name='Opening Stock')
            except Account.DoesNotExist:
                serializers.ValidationError(f'Opening stock account does not exist')
            
            stock =Stock.objects.create(**validated_data)
            if stock.opening_stock_quantity > 0:
                opening_stock_data = {
                    'date': date.today().strftime('%Y-%m-%d'),
                    'description': f'Opening stock for {stock.name}',
                    'purchase_entries': [{
                        'purchased_quantity': stock.opening_stock_quantity,
                        'purchase_price': stock.opening_stock_rate,
                        'stock': stock.id
                    }],
                    'journal_entries': [{
                        'account': opening_stock_account.id,
                        'debit_credit': 'credit',
                        'amount': stock.opening_stock_quantity * stock.opening_stock_rate,
                    }]
                }
                purchase_serializer = PurchaseSerializer(data=opening_stock_data)
                if purchase_serializer.is_valid():
                    purchase_serializer.save()
                    return stock
            return stock
                  
class StockDetailsSerializer(StockSerializer):
    purchase_entries = serializers.SerializerMethodField(read_only=True)
    total_quantity = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Stock
        fields = StockSerializer.Meta.fields + ['purchase_entries', 'total_quantity']

    def get_total_quantity(self, obj):
        purchase_entries = PurchaseEntries.objects.filter(
            stock=obj,
            remaining_quantity__gt=0
        ).order_by('purchase__date')
        total_quantity = sum(entry.remaining_quantity for entry in purchase_entries)
        return total_quantity
    
    def get_purchase_entries(self, obj):
        purchase_entries = PurchaseEntries.objects.filter(
            stock=obj,
            remaining_quantity__gt=0  
        ).order_by('purchase__date')  

        serializer = PurchaseEntriesSerializer(purchase_entries, many=True)
        return serializer.data
    

class PurchaseReturnEntriesSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    purchase_return = serializers.CharField(write_only=True, required=False)
    purchase_entry = serializers.CharField(write_only=True)
    purchase_price = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    cogs = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)

    class Meta:
        fields = '__all__'
        model = PurchaseReturnEntries
    
class PurchaseReturnSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    return_entries = PurchaseReturnEntriesSerializer(many=True)
    class Meta:
        fields = ['id', 'date', 'description', 'return_entries', 'purchase']
        model = PurchaseReturn

    def validate(self, data):
        purchase_return_entries = data.get('return_entries')
        validate_purchase_return_entries(purchase_return_entries)
        return data

    def create(self, validated_data):
        with transaction.atomic():
            return_entries = validated_data.pop('return_entries')
            try:
                purchase_return_account = Account.objects.get(name="Purchase Return")
            except Account.DoesNotExist:
                raise serializers.ValidationError(f"Purchase return account not found")
            
            purchase_id = validated_data.get('purchase')
            try:
                purchase = Purchase.objects.get(id=purchase_id.id)
            except Purchase.DoesNotExist:
                raise serializers.ValidationError(f"Purchase with ID {purchase_id} not found")
            
            validated_data['purchase'] = purchase
            account = purchase.account
            purchase_return = PurchaseReturn.objects.create(account=purchase_return_account, **validated_data)
            cogs = create_purchase_return_entries(return_entries, purchase_return, purchase)

            #If its a bill
            bill = purchase.bill
            print(purchase)
            if bill :
                bill.amount_due -= decimal.Decimal(cogs)
                bill.save()
            purchase_return_account_data =create_journal_entry(purchase_return_account, cogs, "credit")

            payment_account = create_journal_entry(account, cogs, "debit")

            journal_entries_data =[purchase_return_account_data, payment_account]
            validate_double_entry(journal_entries_data)

            create_journal_entries(journal_entries_data, "purcahse_return", purchase_return, AccountDetailsSerializer)

        return purchase_return

class SalesEntriesSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    stock = serializers.CharField(write_only=True)
    sales = serializers.CharField(write_only=True, required=False)
    cogs = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    initial_quantity = serializers.IntegerField(read_only=True)
    stock_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = SalesEntries
        fields = '__all__'

    def get_stock_name(self, obj):
        return obj.stock.name

class SalesSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    sales_entries = SalesEntriesSerializer(many=True)
    journal_entries = JournalEntrySerializer(many=True)
    discount_allowed = DiscountSerializer(required=False, allow_null=True)
    class Meta:
        model = Sales
        fields = ['id', 'date', 'description', 'sales_entries', 'journal_entries', 'discount_allowed']

    def validate(self, data):
        sales_entries = data.get('sales_entries')
        journal_entries = data.get('journal_entries')
        validate_sales_entries(sales_entries)
        validate_journal_entries(journal_entries)
        return data
    
    def create(self, validated_data):
        with transaction.atomic():
            sales_entries = validated_data.pop('sales_entries')
            journal_entries = validated_data.pop('journal_entries')
            discount_allowed = validated_data.pop('discount_allowed')
            sales = Sales.objects.create(**validated_data)
            print(discount_allowed)
            cogs, total_sales_price = create_sales_entries(sales_entries, sales, StockDetailsSerializer)
            if discount_allowed.get('discount_amount') > 0.00 and discount_allowed.get('discount_percentage') > 0.00:
                discount = Discount.objects.create(sales=sales, discount_type='sales', **discount_allowed)
                discount_account = Account.objects.get(name='Discount allowed')
                discount_account_data = create_journal_entry(discount_account, discount.discount_amount, 'debit')
                journal_entries.append(discount_account_data)
            journal_entries = journal_entries_dict(journal_entries, cogs, total_sales_price)
            print(journal_entries)
            validate_double_entry(journal_entries)
            create_journal_entries(journal_entries, "sales", sales, AccountDetailsSerializer)

        return sales

class SalesReturnEntriesSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    sales_return = serializers.CharField(write_only=True, required=False)
    sales_entry = serializers.CharField(write_only=True)
    sales_price = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    cogs = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)

    class Meta:
        fields = '__all__'
        model = SalesReturnEntries
    
class SalesReturnSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    return_entries = SalesReturnEntriesSerializer(many=True)
    class Meta:
        fields = ['id', 'date', 'description', 'return_entries', 'sales']
        model = SalesReturn

    def validate(self, data):
        sales_return_entries = data.get('return_entries')
        validate_sales_return_entries(sales_return_entries)
        return data

    def create(self, validated_data):
        with transaction.atomic():
            return_entries = validated_data.pop('return_entries')

            sales_return_account = Account.objects.get(name="Sales Return")

            sales_id = validated_data.get('sales')
            try:
                sales = Sales.objects.get(id=sales_id.id)
            except Sales.DoesNotExist:
                raise serializers.ValidationError(f"Purchase with ID {sales_id} not found")
            
            validated_data['sales'] = sales
            
            sales_return = SalesReturn.objects.create(account=sales_return_account, **validated_data)
            cogs, total_sales_price = create_sales_return_entries(return_entries, sales_return, sales)
            account = sales.account
            cogs_account = Account.objects.get(name="Cost of goods sold")
            inventory_account = Account.objects.get(name="Inventory")

            #If its an invoice
            invoice = sales.invoice
            if invoice:
                invoice.amount_due -= decimal.Decimal(total_sales_price)
                invoice.save()
                
            sales_return_account_data = create_journal_entry(sales_return_account, total_sales_price, "debit")

            receipt_account = create_journal_entry(account, total_sales_price, "credit")

            inventory_account_data =create_journal_entry(inventory_account, cogs, "debit")

            cogs_account_data = create_journal_entry(cogs_account, cogs, "credit")
            journal_entries_data = [sales_return_account_data, receipt_account, cogs_account_data, inventory_account_data]
            validate_double_entry(journal_entries_data)

            create_journal_entries(journal_entries_data, "sales_return", sales_return, AccountDetailsSerializer)

        return sales_return

class CustomerSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    account = serializers.CharField(read_only=True)
    class Meta:
        model = Customer
        fields = ["id", "name", "email", "phone_number", "account"]

    def create(self, data):
        account = Account.objects.create(name=f"{data.get('name')} a/c", category="asset", sub_category="current_asset")
        customer = Customer.objects.create(account=account, **data)

        return customer

class InvoiceSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    class Meta:
        model = Invoice
        fields = ["id", "due_date", "amount_due", "customer"]

class JournalInvoiceSerializer(JournalSerializer):
    invoice = InvoiceSerializer()
    class Meta:
        model = Journal
        fields = JournalSerializer.Meta.fields + ['invoice']

    def validate(self, data):
        journal_entries = data.get('journal_entries')
        validate_journal_entries(journal_entries)
        return data
    
    def create(self, validated_data):
        with transaction.atomic():
            
            journal_entries = validated_data.pop('journal_entries')
            invoice = validated_data.pop('invoice')
            customer_id = invoice.get('customer')
            try:
                customer = Customer.objects.get(id=customer_id.id)
            except Customer.DoesNotExist:
                raise serializers.ValidationError(f"Customer with ID {customer_id} not found")
            invoice['customer'] = customer
            amount_due = invoice.get('amount_due')
            journal = Journal.objects.create(**validated_data)
            invoice = Invoice.objects.create(journal=journal, total_amount=amount_due, status="unpaid", **invoice)

            account = customer.account

            journal_entries.append({
                "amount": amount_due,
                "debit_credit": "debit",
                "account": account.id
            })
            create_journal_entries(journal_entries, "journal", journal, AccountDetailsSerializer)

        return journal
    
class SupplierSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    account = serializers.CharField(read_only=True)
    class Meta:
        model = Supplier
        fields = ["id", "name", "email", "phone_number", "account"]

    def create(self, data):
        account = Account.objects.create(name=f"{data.get('name')} a/c", category="liability", sub_category="current_liability")
        supplier = Supplier.objects.create(account=account, **data)

        return supplier
    
class BillSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    class Meta:
        model = Bill
        fields = ["id", "due_date", "amount_due", "supplier"]

class PurchaseBillSerializer(PurchaseSerializer):
    bill = BillSerializer()
    journal_entries = JournalEntrySerializer(many=True, required=False)

    class Meta:
        model = Purchase
        fields = PurchaseSerializer.Meta.fields + ['bill']

    def validate(self, data):
        purchase_entries = data.get('purchase_entries')
        validate_purchase_entries(purchase_entries)
        return data
    
    def create(self, validated_data):
        with transaction.atomic():
            journal_entries = []
            purchase_entries_data = validated_data.pop('purchase_entries')
            bill = validated_data.pop('bill')
            discount_received = validated_data.pop('discount_received')
            supplier_id = bill.get('supplier')
            try:
                supplier = Supplier.objects.get(id=supplier_id.id)
            except Supplier.DoesNotExist:
                raise serializers.ValidationError(f"Supplier with ID {supplier_id} not found")
            if discount_received.get('discount_amount') > 0.00 and discount_received.get('discount_percentage') > 0.00:
                discount = Discount.objects.create(purchase=purchase, discount_type='purchase', **discount_received)
                try:
                    discount_account = Account.objects.get(name='Discount received')
                except Account.DoesNotExist:
                    raise serializers.ValidationError('Discount received account not found')
                discount_account_data = create_journal_entry(discount_account, discount.discount_amount, 'credit')
                journal_entries.append(discount_account_data)
            bill['supplier'] = supplier
            amount_due = bill.get('amount_due')

            purchase = Purchase.objects.create(**validated_data)
            payables_account = supplier.account

            bill = Bill.objects.create(purchase=purchase, total_amount=amount_due, status="unpaid", **bill)
 
            cogs = create_purchase_entries(purchase_entries_data, purchase)

            inventory_account = Account.objects.get(name="Inventory")

            inventory_account_data = create_journal_entry(inventory_account, cogs, "debit")
            payables_account_data = create_journal_entry(payables_account, amount_due, "credit")
            journal_entries.append(payables_account_data)
            journal_entries.append(inventory_account_data)
            validate_double_entry(journal_entries)
            create_journal_entries(journal_entries, "purchase", purchase, AccountDetailsSerializer)

           

        return purchase

class SalesInvoiceSerializer(SalesSerializer):
    invoice = InvoiceSerializer()
    journal_entries = JournalEntrySerializer(many=True, required=False)

    class Meta:
        model = Sales
        fields = SalesSerializer.Meta.fields + ['invoice']

    def validate(self, data):
        sales_entries = data.get('sales_entries')
        validate_sales_entries(sales_entries)
        return data
    
    def create(self, validated_data):
        
        with transaction.atomic():
            print(validated_data)
            sales_entries = validated_data.pop('sales_entries')
            journal_entries = []
            invoice = validated_data.pop('invoice')
            discount_allowed = validated_data.pop('discount_allowed')
            customer_id = invoice.get('customer')
            try:
                customer = Customer.objects.get(id=customer_id.id)
            except Customer.DoesNotExist:
                raise serializers.ValidationError(f"Customer with ID {customer_id} not found")
            invoice['customer'] = customer
            amount_due = invoice.get('amount_due')
            receivables_account = customer.account

            sales = Sales.objects.create(**validated_data)
            invoice = Invoice.objects.create(sales=sales, total_amount=amount_due, status="unpaid", **invoice)
            if discount_allowed.get('discount_amount') > 0.00 and discount_allowed.get('discount_percentage') > 0.00:
                discount = Discount.objects.create(sales=sales, discount_type='sales', **discount_allowed)
                discount_account = Account.objects.get(name='Discount allowed')
                discount_account_data = create_journal_entry(discount_account, discount.discount_amount, 'debit')
                journal_entries.append(discount_account_data)

            cogs, total_sales_price = create_sales_entries(sales_entries, sales, StockDetailsSerializer)
            receivables_account_data = create_journal_entry(receivables_account, amount_due, "debit")
            journal_entries.append(receivables_account_data)
            journal_entries = journal_entries_dict(journal_entries, cogs, total_sales_price)
            validate_double_entry(journal_entries)
            create_journal_entries(journal_entries, "sales", sales, AccountDetailsSerializer)
        return sales

class JournalBillSerializer(JournalSerializer):
    bill = BillSerializer(write_only=True)
    class Meta:
        model = Journal
        fields = JournalSerializer.Meta.fields + ['bill']

    def validate(self, data):
        journal_entries = data.get('journal_entries')
        validate_journal_entries(journal_entries)
        return data
    
    def create(self, validated_data):
        with transaction.atomic():
            journal_entries = validated_data.pop('journal_entries')
            bill = validated_data.pop('bill')
            supplier_id = bill.get('supplier')
            try:
                supplier = Supplier.objects.get(id=supplier_id.id)
            except Supplier.DoesNotExist:
                raise serializers.ValidationError(f"Supplier with ID {supplier_id} not found")
            bill['supplier'] = supplier
            amount_due = bill.get('amount_due')
            journal = Journal.objects.create(**validated_data)
            bill = Bill.objects.create(journal=journal, total_amount=amount_due, status="unpaid", **bill)

            account = supplier.account

            journal_entries.append({
                "amount": amount_due,
                "debit_credit": "credit",
                "account": account.id
            })
            create_journal_entries(journal_entries, "journal", journal, AccountDetailsSerializer)

        return journal

class PaymentSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    bill = serializers.CharField(write_only=True, required=False, allow_null=True)
    invoice = serializers.CharField(write_only=True, required=False, allow_null=True)
    
    journal_entries = JournalEntrySerializer(many=True)
    class Meta:
        model = Payment
        fields = ['id', 'date', 'description', "amount_paid", 'bill', 'invoice', 'journal_entries']

    def validate(self, data):
        journal_entries= data.get('journal_entries')
        validate_journal_entries(journal_entries)
        return data

    def create(self, validated_data):
        with transaction.atomic():
            journal_entries_data = validated_data.pop("journal_entries")
            bill_id = validated_data.get("bill")
            invoice_id = validated_data.get("invoice")
            amount_paid = validated_data.get("amount_paid")

            # Validation to ensure only one of bill_id or invoice_id is provided
            if invoice_id and bill_id:
                raise serializers.ValidationError("Only one invoice or bill can be paid at a time")

            # Creating Payment instance
            payment = None
            
            account_data = {}

            if bill_id:
                try:
                    bill = Bill.objects.get(id=bill_id)
                except Bill.DoesNotExist:
                    raise serializers.ValidationError(f"Bill with id {bill_id} not found")
                validated_data['bill'] = bill
                account = bill.supplier.account
                bill.amount_paid += amount_paid
                bill.amount_due -= amount_paid

                # Update the status of the bill
                bill.status = "paid" if bill.amount_due <= 0 else "partially_paid"
                bill.save()
                account_data = {
                    "amount": amount_paid,
                    "debit_credit": "debit",
                    "account": account.id
                }

            if invoice_id:
                try:
                    invoice = Invoice.objects.get(id=invoice_id)
                except Invoice.DoesNotExist:
                    raise serializers.ValidationError(f"Invoice with ID {invoice_id} not found")
                validated_data['invoice'] = invoice
                account = invoice.customer.account
                invoice.amount_paid += amount_paid
                invoice.amount_due -= amount_paid

                # Update the status of the invoice
                invoice.status = "paid" if invoice.amount_paid >= invoice.total_amount else "partially_paid"
                invoice.save()
                account_data = {
                    "amount": amount_paid,
                    "debit_credit": "credit",
                    "account": account.id
                }
            
            payment = Payment.objects.create(**validated_data)

            # Add the account_data to journal_entries_data
            journal_entries_data.append(account_data)
            validate_double_entry(journal_entries_data)
            create_journal_entries(journal_entries_data, "payments", payment, AccountDetailsSerializer)
        return payment

