from rest_framework import serializers
from journals.models import SalesReturnEntries, SalesReturn, Account, Sales, Organisation, FloraUser
from django.db import transaction
from journals.utils import JournalEntriesManager, SalesReturnEntriesManager
from .account import AccountDetailsSerializer, JournalEntrySerializer
from .sales import SalesDetailSerializer
from .sales_entries import SalesEntriesSerializer
import decimal


sales_return_entries_manager = SalesReturnEntriesManager()
journal_entries_manager = JournalEntriesManager()


class SalesReturnEntriesSerializer(serializers.ModelSerializer):
    id = serializers.CharField(required=False)
    sales_return = serializers.CharField(write_only=True, required=False)
    stock_name = serializers.SerializerMethodField(read_only=True)
    return_price = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    quantity = serializers.SerializerMethodField(read_only=True)
    sales_entry = serializers.UUIDField()

    class Meta:
        fields = ['sales_return', 'sales_entry', 'stock_name', 'return_price', 'quantity', 'return_quantity', 'id']
        model = SalesReturnEntries
    
    def get_stock_name(self, obj):
        return obj.stock.name
    
    def get_quantity(self, obj):
        return f"{obj.return_quantity} {obj.stock.unit_alias}"
    
class DetailedSalesReturnEntriesSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    details = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = SalesReturnEntries
        fields = ['id', 'details']

    
    def get_details(self, obj):
        from journals.utils import get_date_description_type_url
        details = get_date_description_type_url(obj)
        details['quantity'] = obj.return_quantity
        details['rate'] = obj.return_price
        details['total'] = float(obj.return_price) * float(obj.return_quantity)

        return details

class SalesReturnSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    return_entries = SalesReturnEntriesSerializer(many=True)
    user = serializers.PrimaryKeyRelatedField(queryset=FloraUser.objects.all())
    organisation = serializers.PrimaryKeyRelatedField(queryset=Organisation.objects.all())
    details = serializers.SerializerMethodField(read_only=True)
    

    class Meta:
        fields = ['id', 'date', 'description', 'return_entries', 'sales', 'user', 'organisation', 'details']
        model = SalesReturn

    def get_details(self, obj):
        entries = SalesReturnEntriesSerializer(obj.return_entries.all(), many=True).data

        sales = getattr(obj, 'sales', None)
        serial_number = ''
        url = ''
        stocks = []
        
        if sales:
            serial_number = sales.serial_number
            url = f'sales/{sales.id}'
            
           
            stocks = [
                {'id': entry.get('id'), 'name': entry.get('stock_name')} 
                for entry in SalesEntriesSerializer(sales.sales_entries.all(), many=True).data
            ]
        total_amount = sum((float(entry.get("return_quantity")) * float(entry.get("return_price")))  for entry in entries)
        total_quantity = sum(int(entry.get("return_quantity")) for entry in entries)
        
        return {
            "serial_number": serial_number,
            "url": url,
            "stocks": stocks,
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
                sales_return_account = Account.objects.get(name="Sales Return", organisation_id=validated_data.get('organisation'))
            except Account.DoesNotExist:
                raise serializers.ValidationError(f"Sales return account not found")
            
            sales_id = validated_data.get('sales')
            try:
                sales = Sales.objects.get(id=sales_id.id)
            except Sales.DoesNotExist:
                raise serializers.ValidationError(f"Sales with ID {sales_id} not found")
            
            validated_data['sales'] = sales
            sales_return = SalesReturn.objects.create(**validated_data)
            sales_serializer = SalesDetailSerializer(sales).data

            journal_entries = sales_serializer.get('journal_entries', [])

            sales_total = float(next((entry['amount'] for entry in journal_entries if entry['type'] == 'sales'), 0))
            discount = float(next((entry['amount'] for entry in journal_entries if entry['type'] == 'discount'), 0))
            discount_percentage = round(((discount / sales_total) * 100), 2)

            total_return = sales_return_entries_manager.create_sales_return_entries(
                return_entries=return_entries,
                sales_return=sales_return, 
                sales=sales, 
                discount_percentage=discount_percentage
            )


            sales_return_account_data = journal_entries_manager.create_journal_entry(sales_return_account, total_return, "credit", "sales_return")
            sales_return.return_total = decimal.Decimal(total_return)

            payment_journal_entries = sales_return_entries_manager.sales_return_journal_entries(
                sales_journal_entries=sales_serializer.get('journal_entries'), 
                total_return_price=total_return, sales=sales, sales_return=sales_return,
                updating=False
            )

            journal_entries_data = [sales_return_account_data]
            journal_entries_data = journal_entries_data + payment_journal_entries

            journal_entries_manager.validate_double_entry(journal_entries_data)

            journal_entries_manager.create_journal_entries(journal_entries_data, "sales_return", sales_return, AccountDetailsSerializer)
            sales.save()
            sales_return.save()

        return sales_return

class DetailedSalesReturnSerializer(SalesReturnSerializer):
    journal_entries = JournalEntrySerializer(many=True, read_only=True)


    class Meta:
        model = SalesReturn
        fields = SalesReturnSerializer.Meta.fields + ['journal_entries']

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
    
    def update(self, instance, validated_data):
        with transaction.atomic():
            return_entries = validated_data.pop('return_entries')
            try:
                sales_return_account = Account.objects.get(name="Sales Return", organisation_id=validated_data.get('organisation'))
            except Account.DoesNotExist:
                raise serializers.ValidationError(f"Sales return account not found")
            
            sales_return = instance
            
            sales = getattr(sales_return, 'sales', None)
            if not sales:
                raise serializers.ValidationError("No related sales found for the sales return.")
            
           
            sales_serializer = SalesDetailSerializer(sales).data
            
            sales_return.date = validated_data.get('date', sales_return.date)
            sales_return.description = validated_data.get('description', sales_return.description)

            journal_entries = sales_serializer.get('journal_entries', [])

            sales_total = float(next((entry['amount'] for entry in journal_entries if entry['type'] == 'sales'), 0))
            discount = float(next((entry['amount'] for entry in journal_entries if entry['type'] == 'discount'), 0))
            discount_percentage = (discount / sales_total) * 100

            sales_return.journal_entries.all().delete()


            total_return, return_entries_id = sales_return_entries_manager.update_sales_return_entries(
                return_entries=return_entries,
                sales_return=sales_return,
                sales=sales, 
                discount_percentage=discount_percentage
            )


            sales_return_account_data = journal_entries_manager.create_journal_entry(
                sales_return_account, total_return, "credit", "sales_return"
            )
            sales_return.return_total = decimal.Decimal(total_return)

            payment_journal_entries = sales_return_entries_manager.sales_return_journal_entries(
                sales_journal_entries=sales_serializer.get('journal_entries'), 
                total_return_price=total_return, 
                sales=sales,
                sales_return=sales_return,
                updating=True
            )

            journal_entries_data = [sales_return_account_data]
            journal_entries_data = journal_entries_data + payment_journal_entries


            journal_entries_manager.validate_double_entry(journal_entries_data)

            journal_entries_manager.create_journal_entries(
                journal_entries_data=journal_entries_data, 
                type="sales_return", 
                table=sales_return)

            sales_return.return_entries.exclude(id__in=return_entries_id).delete()
            
            sales_return.save()

        return sales_return
    

  