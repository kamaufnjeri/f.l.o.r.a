from rest_framework import serializers
from django.utils import timezone
import decimal
from datetime import date
from django.db import transaction, models
from .models import Bill, Invoice, Supplier
from .models import SalesEntries, Journal, JournalEntries, Account, Stock, PurchaseEntries, Customer, Payment
from .models import Sales, Purchase, SalesReturnEntries, PurchaseReturnEntries, PurchaseReturn, SalesReturn
from .utils import journal_entries_dict, validate_sales_entries, create_sales_entries
from .utils import create_purchase_return_entries, validate_purchase_return_entries
from .utils import create_journal_entries, create_purchase_entries, validate_journal_entries
from .utils import validate_purchase_entries, validate_double_entry, validate_sales_return_entries
from .utils import create_sales_return_entries, get_payment_account, get_receipt_account

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
        fields = ['id', 'name', 'category', 'sub_category', 'opening_balance', 'opening_balance_type']
        required_fields = ['name', 'category', 'sub_category']
        model = Account

    def validate(self, data):
        categories = {
            "asset": ["current_asset", "non-current_asset"],
            "liability": ["current_liability", "long-term_liability"],
            "capital": ["capital"],
            "expense": ["indirect_expense", "cost_of_goods_sold"],
            "income": ["sales_revenue", "indirect_income"]
        }

        opening_balance_type = ['debit', 'credit']
        if data.get('category') not in categories.keys():
            raise serializers.ValidationError(f'{data.get("category")} category not one of the following: {", ".join(categories.keys())}')

        if data.get('sub_category') not in categories[data.get('category')]:
            raise serializers.ValidationError(
                f'{data.get("category")} can only have the following sub categories: {", ".join(categories[data.get("category")])}'
            )
        
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
        
        # Determine whether to use a date filter or not
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
        
        # Calculate balance
        debit_total = sum(entry.amount for entry in journal_entries if entry.debit_credit == 'debit')
        credit_total = sum(entry.amount for entry in journal_entries if entry.debit_credit == 'credit')

        if obj.opening_balance and obj.opening_balance_type:
            if obj.opening_balance_type == 'debit':
                debit_total += obj.opening_balance
            else:
                credit_total += obj.opening_balance

        if obj.category in ('asset', 'expense'):
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
class PurchaseSerializer(serializers.ModelSerializer):

    id = serializers.CharField(read_only=True)
    purchase_entries = PurchaseEntriesSerializer(many=True)
    journal_entries = JournalEntrySerializer(many=True)
 
    class Meta:
        model = Purchase
        fields = ['id', 'date', 'description', 'purchase_entries', 'journal_entries']

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
            
            account = get_payment_account(journal_entries, AccountDetailsSerializer)
            purchase = Purchase.objects.create(account=account, **validated_data)
            cogs = create_purchase_entries(purchase_entries_data, purchase)

            inventory_account = Account.objects.get(name="Inventory")

            inventory_account_data = {
                "account": inventory_account.id,
                "amount": cogs,
                "debit_credit": "debit"
            }
           
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
            opening_stock_account = Account.objects.get(name='Opening Stock')
            
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
        # Filter purchase entries related to the stock
        purchase_entries = PurchaseEntries.objects.filter(
            stock=obj,
            remaining_quantity__gt=0  # Example condition: only include entries with remaining quantity greater than 0
        ).order_by('purchase__date')  # Adjust ordering if needed

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
            purchase_return_account_data = {
                "account": purchase_return_account.id,
                "amount": cogs,
                "debit_credit": "credit"
            }

            payment_account = {
                "account": account.id,
                "amount": cogs,
                "debit_credit": "debit"
            }

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
 
    class Meta:
        model = Sales
        fields = ['id', 'date', 'description', 'sales_entries', 'journal_entries']

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
            
            account = get_receipt_account(journal_entries, AccountDetailsSerializer)
            sales = Sales.objects.create(account=account, **validated_data)
            cogs, total_sales_price = create_sales_entries(sales_entries, sales, StockDetailsSerializer)

            journal_entries = journal_entries_dict(journal_entries, cogs, total_sales_price)
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
                
            sales_return_account_data = {
                "account": sales_return_account.id,
                "amount": total_sales_price,
                "debit_credit": "debit"
            }

            receipt_account = {
                "account": account.id,
                "amount": total_sales_price,
                "debit_credit": "credit"
            }

            inventory_account_data = {
                "account": inventory_account.id,
                "amount": cogs,
                "debit_credit": "debit"
            }

            cogs_account_data = {
                "account": cogs_account.id,
                "amount": cogs,
                "debit_credit": "credit"
            }

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
            journal_entries = validated_data.pop('journal_entries')
            purchase_entries_data = validated_data.pop('purchase_entries')

            bill = validated_data.pop('bill')
            supplier_id = bill.get('supplier')
            try:
                supplier = Supplier.objects.get(id=supplier_id.id)
            except Supplier.DoesNotExist:
                raise serializers.ValidationError(f"Supplier with ID {supplier_id} not found")
            bill['supplier'] = supplier
            amount_due = bill.get('amount_due')
            account = supplier.account

            purchase = Purchase.objects.create(account=account, **validated_data)

            bill = Bill.objects.create(purchase=purchase, total_amount=amount_due, status="unpaid", **bill)
 
            cogs = create_purchase_entries(purchase_entries_data, purchase)

            inventory_account = Account.objects.get(name="Inventory")

            inventory_account_data = {
                "account": inventory_account.id,
                "amount": cogs,
                "debit_credit": "debit"
            }
            journal_entries.append({
                "amount": amount_due,
                "debit_credit": "credit",
                "account": account.id
            })
            journal_entries.append(inventory_account_data)
            validate_double_entry(journal_entries)
            create_journal_entries(journal_entries, "purchase", purchase, AccountDetailsSerializer)

           

        return purchase

class SalesInvoiceSerializer(SalesSerializer):
    invoice = InvoiceSerializer()
    class Meta:
        model = Sales
        fields = SalesSerializer.Meta.fields + ['invoice']

    def validate(self, data):
        sales_entries = data.get('sales_entries')
        validate_sales_entries(sales_entries)
        return data
    
    def create(self, validated_data):
        
        with transaction.atomic():
            sales_entries = validated_data.pop('sales_entries')
            journal_entries = validated_data.pop('journal_entries')
            invoice = validated_data.pop('invoice')
            customer_id = invoice.get('customer')
            try:
                customer = Customer.objects.get(id=customer_id.id)
            except Customer.DoesNotExist:
                raise serializers.ValidationError(f"Customer with ID {customer_id} not found")
            invoice['customer'] = customer
            amount_due = invoice.get('amount_due')
            account = customer.account

            sales = Sales.objects.create(account=account, **validated_data)
            invoice = Invoice.objects.create(sales=sales, total_amount=amount_due, status="unpaid", **invoice)

            cogs, total_sales_price = create_sales_entries(sales_entries, sales, StockDetailsSerializer)

            journal_entries.append({
                "amount": amount_due,
                "debit_credit": "debit",
                "account": account.id
            })
            journal_entries = journal_entries_dict(journal_entries, cogs, total_sales_price)
            validate_double_entry(journal_entries)
            create_journal_entries(journal_entries, "sales", sales, AccountDetailsSerializer)
        return sales

class JournalBillSerializer(JournalSerializer):
    bill = BillSerializer(many=True, write_only=True)
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

