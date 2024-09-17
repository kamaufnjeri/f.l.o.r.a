from rest_framework import serializers
from journals.models import Invoice, Journal, Sales, Customer, Discount, Account
from .account import AccountDetailsSerializer
from .journal import JournalSerializer
from .bill_invoice import InvoiceSerializer
from .journal_entries import JournalEntrySerializer
from .sales import SalesSerializer
from .account import AccountDetailsSerializer
from .stock import StockDetailsSerializer
from django.db import transaction
from journals.utils import JournalEntriesManager, SalesEntriesManager

journal_entries_manager = JournalEntriesManager()
sales_entries_manager = SalesEntriesManager()




class JournalInvoiceSerializer(JournalSerializer):
    invoice = InvoiceSerializer()
    class Meta:
        model = Journal
        fields = JournalSerializer.Meta.fields + ['invoice']

    def validate(self, data):
        journal_entries = data.get('journal_entries')
        journal_entries_manager.validate_journal_entries(journal_entries)
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
            journal_entries_manager.create_journal_entries(journal_entries, "journal", journal, AccountDetailsSerializer)

        return journal
    
class SalesInvoiceSerializer(SalesSerializer):
    journal_entries = JournalEntrySerializer(many=True, required=False)

    class Meta:
        model = Sales
        fields = SalesSerializer.Meta.fields + ['invoice']

    def validate(self, data):
        sales_entries = data.get('sales_entries')
        sales_entries_manager.validate_sales_entries(sales_entries)
        return data
    
    def create(self, validated_data): 
        with transaction.atomic():
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
                discount_account_data = journal_entries_manager.create_journal_entry(discount_account, discount.discount_amount, 'debit')
                journal_entries.append(discount_account_data)

            cogs, total_sales_price = sales_entries_manager.create_sales_entries(sales_entries, sales, StockDetailsSerializer)
            receivables_account_data = journal_entries_manager.create_journal_entry(receivables_account, amount_due, "debit")
            journal_entries.append(receivables_account_data)
            journal_entries = journal_entries_manager.sales_journal_entries_dict(journal_entries, cogs, total_sales_price)
            journal_entries_manager.validate_double_entry(journal_entries)
            journal_entries_manager.create_journal_entries(journal_entries, "sales", sales, AccountDetailsSerializer)
        return sales