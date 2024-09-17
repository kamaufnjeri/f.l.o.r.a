from rest_framework import serializers
from .purchase_entries import PurchaseEntriesSerializer
from .journal_entries import JournalEntrySerializer
from .account import AccountDetailsSerializer
from .bill_invoice import BillSerializer
from .discount import DiscountSerializer
from journals.models import Purchase, Account, Discount
from django.db import transaction
from journals.utils import PurchaseEntriesManager, JournalEntriesManager

purchase_entries_manager = PurchaseEntriesManager()
journal_entries_manager = JournalEntriesManager()

class PurchaseSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    purchase_entries = PurchaseEntriesSerializer(many=True)
    journal_entries = JournalEntrySerializer(many=True)
    discount_received = DiscountSerializer(allow_null=True, required=False)
    bill = BillSerializer(required=False)
 
    class Meta:
        model = Purchase
        fields = ['id', 'date', 'description', 'purchase_entries', 'journal_entries', 'discount_received', 'bill']

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
                inventory_account = Account.objects.get(name="Inventory")
            except Account.DoesNotExist:
                raise serializers.ValidationError('Inventory Account not found')
            if discount_received and (discount_received.get('discount_amount') > 0.00 and discount_received.get('discount_percentage') > 0.00):
                discount = Discount.objects.create(purchase=purchase, discount_type='purchase', **discount_received)
                try:
                    discount_account = Account.objects.get(name='Discount received')
                except Account.DoesNotExist:
                    raise serializers.ValidationError('Discount received account not found')
                discount_account_data = journal_entries_manager.create_journal_entry(discount_account, discount.discount_amount, 'credit')
                journal_entries.append(discount_account_data)
            inventory_account_data = journal_entries_manager.create_journal_entry(inventory_account, cogs, "debit")
            journal_entries.append(inventory_account_data)
            journal_entries_manager.validate_double_entry(journal_entries)
            journal_entries_manager.create_journal_entries(journal_entries, "purchase", purchase, AccountDetailsSerializer)

        return purchase