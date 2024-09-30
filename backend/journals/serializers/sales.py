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
    invoice = InvoiceSerializer(required=False, write_only=True)
    items_data = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Sales
        fields = [
            'id', 'date', 'description', 'sales_entries',
            'journal_entries', 'discount_allowed', 'invoice',
            "serial_number", 'items_data'
        ]

    

    def get_items_data(self, obj):
        """Return the type based on the bill attribute."""
        type = 'regular'
        sales_entries = SalesEntriesSerializer(obj.sales_entries.all(), many=True)
        items_list = [entry['stock_name'] for entry in sales_entries.data]
        total_amount = sum((float(entry['sales_price']) * float(entry['sold_quantity']) )for entry in SalesEntriesSerializer(obj.sales_entries.all(), many=True).data)
        total_quantity = sum(int(entry['sold_quantity'] ) for entry in SalesEntriesSerializer(obj.sales_entries.all(), many=True).data)
        amount_due = 0

        if hasattr(obj, 'invoice') and obj.invoice is not None:
            amount_due = obj.invoice.amount_due
            type = 'invoice'

        return {
            "list": items_list,
            "type": type,
            "total_amount": total_amount,
            "total_quantity": total_quantity,
            "amount_due": amount_due
        }

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
    sales_entries = SalesEntriesSerializer(many=True, read_only=True)
    journal_entries = JournalEntrySerializer(many=True, read_only=True)
    discount_allowed = DiscountSerializer(allow_null=True, required=False, read_only=True)
    invoice = InvoiceSerializer(read_only=True)

    class Meta:
        model = Sales
        fields = SalesSerializer.Meta.fields

    def to_representation(self, instance):
        data = super().to_representation(instance)
        
        journal_entries = data.get('journal_entries', [])
        
        sorted_journal_entries = sorted(journal_entries, key=lambda entry: entry.get('debit_credit') == 'credit')
        
        debit_total = sum(float(entry.get('amount')) for entry in sorted_journal_entries if entry.get('debit_credit') == 'debit')
        credit_total = sum(float(entry.get('amount')) for entry in sorted_journal_entries if entry.get('debit_credit') == 'credit')
        data['journal_entries'] = sorted_journal_entries
        data['journal_entries_total'] = {
            "debit_total": debit_total,
            "credit_total": credit_total
        }

        return data