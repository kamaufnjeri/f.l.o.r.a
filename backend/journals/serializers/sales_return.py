from rest_framework import serializers
from journals.models import SalesReturnEntries, SalesReturn, Sales, Account, FloraUser, Organisation
import decimal
from django.db import transaction
from .sales import SalesDetailSerializer
from .account import AccountDetailsSerializer, JournalEntrySerializer
from journals.utils import JournalEntriesManager, SalesReturnEntriesManager

sales_return_entries_manager = SalesReturnEntriesManager()
journal_entries_manager = JournalEntriesManager()

class SalesReturnEntriesSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    sales_return = serializers.CharField(write_only=True, required=False)
    sales_entry = serializers.CharField(write_only=True)
    stock_name = serializers.SerializerMethodField(read_only=True)
    return_price = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    quantity = serializers.SerializerMethodField(read_only=True)


    class Meta:
        fields =  ['sales_return', 'sales_entry', 'stock_name', 'return_price', 'quantity', 'return_quantity', 'id']
        model = SalesReturnEntries

    def get_stock_name(self, obj):
        return obj.stock.name
    
    def get_quantity(self, obj):
        return f"{obj.return_quantity} {obj.stock.unit_alias}"
    
  
    
class SalesReturnSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    return_entries = SalesReturnEntriesSerializer(many=True)
    sales_no = serializers.SerializerMethodField(read_only=True)
    user = serializers.PrimaryKeyRelatedField(queryset=FloraUser.objects.all())
    organisation = serializers.PrimaryKeyRelatedField(queryset=Organisation.objects.all())
    journal_entries = JournalEntrySerializer(many=True, read_only=True)
    items_data = serializers.SerializerMethodField(read_only=True)


    class Meta:
        fields = ['id', 'date', 'description', 'return_entries', 'sales', 'sales_no', 'organisation', 'user', 'journal_entries', 'items_data']
        model = SalesReturn

    def get_sales_no(self, obj):
        return obj.sales.serial_number
    
    def get_items_data(self, obj):
        entries = SalesReturnEntriesSerializer(obj.return_entries.all(), many=True).data
        total_amount = sum((float(entry.get("return_quantity")) * float(entry.get("return_price")))  for entry in entries)
        total_quantity = sum(int(entry.get("return_quantity")) for entry in entries)
        return {
            "total_amount": total_amount,
            "total_quantity": total_quantity
        }

    def validate(self, data):
        sales_return_entries = data.get('return_entries')
        sales_return_entries_manager.validate_sales_return_entries(sales_return_entries)
        return data

    def create(self, validated_data):
        with transaction.atomic():
            return_entries = validated_data.pop('return_entries')

            try:

                sales_return_account = Account.objects.get(name="Sales Return", organisation=validated_data.get('organisation'))
            except Account.DoesNotExist:
                raise serializers.ValidationError('Sales Return account not found')

            sales_id = validated_data.get('sales')
            try:
                sales = Sales.objects.get(id=sales_id.id)
            except Sales.DoesNotExist:
                raise serializers.ValidationError(f"Purchase with ID {sales_id} not found")
            
            validated_data['sales'] = sales
            
            sales_return = SalesReturn.objects.create(**validated_data)

            discount_percentage = None
            sales_serializer = SalesDetailSerializer(sales).data
            discount = sales_serializer.get('discount_allowed') 
            if discount != None:
                discount_percentage = discount.get("discount_percentage")
            total_return_price = sales_return_entries_manager.create_sales_return_entries(return_entries, sales_return, sales, discount_percentage)
            
            
            
            if sales_serializer.get('invoice') != None:
                invoice = sales.invoice
                invoice.amount_due -= decimal.Decimal(total_return_price)
                invoice.save()
            sales_return_account_data = journal_entries_manager.create_journal_entry(sales_return_account, total_return_price, "debit")

            receipt_journal_entries = sales_return_entries_manager.sales_return_journal_entries(sales_serializer.get('journal_entries'), total_return_price)
            sales.returns_total -= decimal.Decimal(total_return_price)
            journal_entries_data = [sales_return_account_data]
            journal_entries_data = journal_entries_data + receipt_journal_entries
            journal_entries_manager.validate_double_entry(journal_entries_data)
            sales.save()

            journal_entries_manager.create_journal_entries(journal_entries_data, "sales_return", sales_return, AccountDetailsSerializer)

        return sales_return