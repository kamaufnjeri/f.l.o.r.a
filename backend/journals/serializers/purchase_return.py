from rest_framework import serializers
from journals.models import PurchaseReturnEntries, PurchaseReturn, Account, Purchase, Organisation, FloraUser
from django.db import transaction
from journals.utils import JournalEntriesManager, PurchaseReturnEntriesManager
from .account import AccountDetailsSerializer, JournalEntrySerializer
from .purchase import PurchaseDetailSerializer
import decimal


purchase_return_entries_manager = PurchaseReturnEntriesManager()
journal_entries_manager = JournalEntriesManager()


class PurchaseReturnEntriesSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    purchase_return = serializers.CharField(write_only=True, required=False)
    purchase_entry = serializers.CharField(write_only=True)
    stock_name = serializers.SerializerMethodField(read_only=True)
    return_price = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    quantity = serializers.SerializerMethodField(read_only=True)

    class Meta:
        fields = ['purchase_return', 'purchase_entry', 'stock_name', 'return_price', 'quantity', 'return_quantity', 'id']
        model = PurchaseReturnEntries
    
    def get_stock_name(self, obj):
        return obj.stock.name
    
    def get_quantity(self, obj):
        return f"{obj.return_quantity} {obj.stock.unit_alias}"
    
class DetailedPurchaseReturnEntriesSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
   
    details = serializers.SerializerMethodField(read_only=True)
    

    class Meta:
        model = PurchaseReturnEntries
        fields = ['id', 'details']

    
    def get_details(self, obj):
        from journals.utils import get_date_description_type_url
        details = get_date_description_type_url(obj)
        details['quantity'] = obj.return_quantity
        details['rate'] = obj.return_price
        details['total'] = float(obj.return_price) * float(obj.return_quantity)

        return details

class PurchaseReturnSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    return_entries = PurchaseReturnEntriesSerializer(many=True)
    purchase_no = serializers.SerializerMethodField(read_only=True)
    user = serializers.PrimaryKeyRelatedField(queryset=FloraUser.objects.all())
    organisation = serializers.PrimaryKeyRelatedField(queryset=Organisation.objects.all())
    journal_entries = JournalEntrySerializer(many=True, read_only=True)
    items_data = serializers.SerializerMethodField(read_only=True)

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

    class Meta:
        fields = ['id', 'date', 'description', 'return_entries', 'purchase', "purchase_no", 'user', 'organisation', 'journal_entries', 'items_data']
        model = PurchaseReturn

    def get_purchase_no(self, obj):
        return obj.purchase.serial_number
    
    def get_items_data(self, obj):
        entries = PurchaseReturnEntriesSerializer(obj.return_entries.all(), many=True).data
        total_amount = sum((float(entry.get("return_quantity")) * float(entry.get("return_price")))  for entry in entries)
        total_quantity = sum(int(entry.get("return_quantity")) for entry in entries)
        return {
            "total_amount": total_amount,
            "total_quantity": total_quantity
        }

    def validate(self, data):
        purchase_return_entries = data.get('return_entries')
        purchase_return_entries_manager.validate_purchase_return_entries(purchase_return_entries)
        return data

    def create(self, validated_data):
        with transaction.atomic():
            return_entries = validated_data.pop('return_entries')
            try:
                purchase_return_account = Account.objects.get(name="Purchase Return", organisation_id=validated_data.get('organisation'))
            except Account.DoesNotExist:
                raise serializers.ValidationError(f"Purchase return account not found")
            
            purchase_id = validated_data.get('purchase')
            try:
                purchase = Purchase.objects.get(id=purchase_id.id)
            except Purchase.DoesNotExist:
                raise serializers.ValidationError(f"Purchase with ID {purchase_id} not found")
            
            validated_data['purchase'] = purchase
            purchase_return = PurchaseReturn.objects.create(**validated_data)
            purchase_serializer = PurchaseDetailSerializer(purchase).data

            discount_percentage = None
            discount = purchase_serializer.get('discount_received') 
            if discount != None:
                discount_percentage = discount.get("discount_percentage")

            cogs = purchase_return_entries_manager.create_purchase_return_entries(return_entries, purchase_return, purchase, discount_percentage)

            if purchase_serializer.get('bill') != None:
                bill = purchase.bill
                bill.amount_due -= decimal.Decimal(cogs)
                bill.save()
            
            purchase_return_account_data = journal_entries_manager.create_journal_entry(purchase_return_account, cogs, "credit")
            purchase.returns_total += decimal.Decimal(cogs)

            payment_journal_entries = purchase_return_entries_manager.purchase_return_journal_entries(purchase_serializer.get('journal_entries'), cogs)

            journal_entries_data = [purchase_return_account_data]
            journal_entries_data = journal_entries_data + payment_journal_entries

            journal_entries_manager.validate_double_entry(journal_entries_data)

            journal_entries_manager.create_journal_entries(journal_entries_data, "purchase_return", purchase_return, AccountDetailsSerializer)
            purchase.save()

        return purchase_return