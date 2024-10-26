from rest_framework import serializers
from .purchase_entries import PurchaseEntriesSerializer
from .journal_entries import JournalEntrySerializer
from .account import AccountDetailsSerializer
from .bill_invoice import BillSerializer
from .discount import DiscountSerializer
from journals.models import Purchase, Account, Discount, FloraUser, Organisation
from django.db import transaction
from journals.utils import PurchaseEntriesManager, JournalEntriesManager

purchase_entries_manager = PurchaseEntriesManager()
journal_entries_manager = JournalEntriesManager()



class PurchaseSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    purchase_entries = PurchaseEntriesSerializer(many=True, write_only=True)
    journal_entries = JournalEntrySerializer(many=True, write_only=True)
    discount_received = DiscountSerializer(allow_null=True, required=False, write_only=True)
    bill = BillSerializer(required=False, write_only=True)
    items_data = serializers.SerializerMethodField(read_only=True)
    user = serializers.PrimaryKeyRelatedField(queryset=FloraUser.objects.all())
    organisation = serializers.PrimaryKeyRelatedField(queryset=Organisation.objects.all())
 
    class Meta:
        model = Purchase
        fields = [
            'id', 'date', 'description', 'purchase_entries', 
            'journal_entries', 'discount_received', 'bill', 
            'serial_number', 'items_data', 'user', 'organisation'
        ]

    def get_items_data(self, obj):
        """Return the type based on the bill attribute."""
        type = 'regular'
        purchase_entries = PurchaseEntriesSerializer(obj.purchase_entries.all(), many=True)
        items_list = [entry['stock_name'] for entry in purchase_entries.data]
        total_amount = sum((float(entry['purchase_price']) * float(entry['purchased_quantity']) )for entry in PurchaseEntriesSerializer(obj.purchase_entries.all(), many=True).data)
        total_quantity = sum(int(entry['purchased_quantity'] ) for entry in PurchaseEntriesSerializer(obj.purchase_entries.all(), many=True).data)
        amount_due = 0

        if hasattr(obj, 'bill') and obj.bill is not None:
            amount_due = obj.bill.amount_due
            type = 'bill'

        return {
            "list": items_list,
            "type": type,
            "total_amount": total_amount,
            "total_quantity": total_quantity,
            "amount_due": amount_due
        }
    
    
    
    def validate(self, data):
        purchase_entries = data.get('purchase_entries')
        journal_entries = data.get('journal_entries')

        purchase_entries_manager.validate_purchase_entries(purchase_entries)
        journal_entries_manager.validate_journal_entries(journal_entries)

        return data
    
    def create(self, validated_data):
        with transaction.atomic():
            purchase_entries_data = validated_data.pop('purchase_entries')
            journal_entries = validated_data.pop('journal_entries')
            discount_received = validated_data.pop('discount_received', None)
            purchase = Purchase.objects.create(**validated_data)
            cogs = purchase_entries_manager.create_purchase_entries(purchase_entries_data, purchase)
            try:
                inventory_account = Account.objects.get(name="Inventory", organisation=validated_data.get('organisation'))
            except Account.DoesNotExist:
                raise serializers.ValidationError('Inventory Account not found')
            if discount_received and (discount_received.get('discount_amount') > 0.00 and discount_received.get('discount_percentage') > 0.00):
                discount = Discount.objects.create(purchase=purchase, discount_type='purchase', **discount_received)
                try:
                    discount_account = Account.objects.get(name='Discount received', organisation_id=validated_data.get('organisation'))
                except Account.DoesNotExist:
                    raise serializers.ValidationError('Discount received account not found')
                discount_account_data = journal_entries_manager.create_journal_entry(discount_account, discount.discount_amount, 'credit')
                journal_entries.append(discount_account_data)
            inventory_account_data = journal_entries_manager.create_journal_entry(inventory_account, cogs, "debit")
            journal_entries.append(inventory_account_data)
            journal_entries_manager.validate_double_entry(journal_entries)
            journal_entries_manager.create_journal_entries(journal_entries, "purchase", purchase, AccountDetailsSerializer)

        return purchase
    
class PurchaseDetailSerializer(PurchaseSerializer):
    purchase_entries = PurchaseEntriesSerializer(many=True, read_only=True)
    journal_entries = JournalEntrySerializer(many=True, read_only=True)
    discount_received = DiscountSerializer(allow_null=True, required=False, read_only=True)
    bill = BillSerializer(read_only=True)
    has_returns = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Purchase
        fields = PurchaseSerializer.Meta.fields + ["has_returns"]

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

    def get_has_returns(self, obj):
        if hasattr(obj, "purchase_return") and obj.purchase_return.exists():
            
            return True

        return False