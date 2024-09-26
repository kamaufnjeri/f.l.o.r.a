from rest_framework import serializers
from journals.models import Sales, Discount, Account
from .stock import StockDetailsSerializer
from .account import AccountDetailsSerializer
from .journal_entries import JournalEntrySerializer
from .sales_entries import SalesEntriesSerializer
from .bill_invoice import InvoiceSerializer
from .discount import DiscountSerializer
from journals.utils import JournalEntriesManager, SalesEntriesManager
from django.db import transaction


sales_entries_manager = SalesEntriesManager()
journal_entries_manager = JournalEntriesManager()

class SalesSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    sales_entries = SalesEntriesSerializer(many=True, write_only=True)
    journal_entries = JournalEntrySerializer(many=True, write_only=True)
    discount_allowed = DiscountSerializer(required=False, allow_null=True, write_only=True)
    invoice = InvoiceSerializer(required=False)

    class Meta:
        model = Sales
        fields = ['id', 'date', 'description', 'sales_entries', 'journal_entries', 'discount_allowed', 'invoice', "serial_number"]

    def validate(self, data):
        sales_entries = data.get('sales_entries')
        journal_entries = data.get('journal_entries')
        sales_entries_manager.validate_sales_entries(sales_entries)
        journal_entries_manager.validate_journal_entries(journal_entries)
        return data
    
    def create(self, validated_data):
        with transaction.atomic():
            sales_entries = validated_data.pop('sales_entries')
            journal_entries = validated_data.pop('journal_entries')
            discount_allowed = validated_data.pop('discount_allowed')
            sales = Sales.objects.create(**validated_data)
            cogs, total_sales_price = sales_entries_manager.create_sales_entries(sales_entries, sales, StockDetailsSerializer)
            if discount_allowed.get('discount_amount') > 0.00 and discount_allowed.get('discount_percentage') > 0.00:
                discount = Discount.objects.create(sales=sales, discount_type='sales', **discount_allowed)
                discount_account = Account.objects.get(name='Discount allowed')
                discount_account_data = journal_entries_manager.create_journal_entry(discount_account, discount.discount_amount, 'debit')
                journal_entries.append(discount_account_data)
            journal_entries = journal_entries_manager.sales_journal_entries_dict(journal_entries, cogs, total_sales_price)
            journal_entries_manager.validate_double_entry(journal_entries)
            journal_entries_manager.create_journal_entries(journal_entries, "sales", sales, AccountDetailsSerializer)

        return sales
    
class SalesDetailSerializer(SalesSerializer):
    purchase_entries = SalesEntriesSerializer(many=True, read_only=True)
    journal_entries = JournalEntrySerializer(many=True, read_only=True)
    discount_allowed = DiscountSerializer(allow_null=True, required=False, read_only=True)

    class Meta:
        model = Sales
        fields = SalesSerializer.Meta.fields