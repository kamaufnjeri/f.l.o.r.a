from rest_framework import serializers
from journals.models import SalesReturnEntries, SalesReturn, Sales, Account
import decimal
from django.db import transaction
from .sales import SalesSerializer
from .account import AccountDetailsSerializer
from journals.utils import JournalEntriesManager, SalesReturnEntriesManager

sales_return_entries_manager = SalesReturnEntriesManager()
journal_entries_manager = JournalEntriesManager()

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
        sales_return_entries_manager.validate_sales_return_entries(sales_return_entries)
        return data

    def create(self, validated_data):
        with transaction.atomic():
            return_entries = validated_data.pop('return_entries')

            try:

                sales_return_account = Account.objects.get(name="Sales Return")
            except Account.DoesNotExist:
                raise serializers.ValidationError('Sales Return account not found')

            sales_id = validated_data.get('sales')
            try:
                sales = Sales.objects.get(id=sales_id.id)
            except Sales.DoesNotExist:
                raise serializers.ValidationError(f"Purchase with ID {sales_id} not found")
            
            validated_data['sales'] = sales
            
            sales_return = SalesReturn.objects.create(**validated_data)
            cogs, total_sales_price = sales_return_entries_manager.create_sales_return_entries(return_entries, sales_return, sales)
            cogs_account = Account.objects.get(name="Cost of goods sold")
            inventory_account = Account.objects.get(name="Inventory")

            #If its an invoice
            
            sales_serializer = SalesSerializer(sales).data
            if sales_serializer.get('invoice') != None:
                invoice = sales
                invoice.amount_due -= decimal.Decimal(total_sales_price)
                invoice.save()
            sales_return_account_data = journal_entries_manager.create_journal_entry(sales_return_account, total_sales_price, "debit")

            receipt_journal_entries = sales_return_entries_manager.sales_return_journal_entries(sales_serializer.get('journal_entries'), total_sales_price)

            inventory_account_data = journal_entries_manager.create_journal_entry(inventory_account, cogs, "debit")

            cogs_account_data = journal_entries_manager.create_journal_entry(cogs_account, cogs, "credit")
            journal_entries_data = [sales_return_account_data, cogs_account_data, inventory_account_data]
            journal_entries_data = journal_entries_data + receipt_journal_entries
            journal_entries_manager.validate_double_entry(journal_entries_data)

            journal_entries_manager.create_journal_entries(journal_entries_data, "sales_return", sales_return, AccountDetailsSerializer)

        return sales_return