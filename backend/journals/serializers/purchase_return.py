from rest_framework import serializers
from journals.models import PurchaseReturnEntries, PurchaseReturn, Account, Purchase
from django.db import transaction
from journals.utils import JournalEntriesManager, PurchaseReturnEntriesManager
from .account import AccountDetailsSerializer
from .purchase import PurchaseDetailSerializer
import decimal


purchase_return_entries_manager = PurchaseReturnEntriesManager()
journal_entries_manager = JournalEntriesManager()


class PurchaseReturnEntriesSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    purchase_return = serializers.CharField(write_only=True, required=False)
    purchase_entry = serializers.CharField(write_only=True)
    purchase_price = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    cogs = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    stock_name = serializers.SerializerMethodField(read_only=True)
    stock = serializers.CharField(read_only=True)

    class Meta:
        fields = '__all__'
        model = PurchaseReturnEntries
    
    def get_stock_name(self, obj):
        return obj.stock.name
    

class PurchaseReturnSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    return_entries = PurchaseReturnEntriesSerializer(many=True)
    purchase_no = serializers.SerializerMethodField(read_only=True)

    class Meta:
        fields = ['id', 'date', 'description', 'return_entries', 'purchase', "purchase_no"]
        model = PurchaseReturn

    def get_purchase_no(self, obj):
        return obj.purchase.serial_number
    

    def validate(self, data):
        purchase_return_entries = data.get('return_entries')
        purchase_return_entries_manager.validate_purchase_return_entries(purchase_return_entries)
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
            purchase_return = PurchaseReturn.objects.create(**validated_data)
            cogs = purchase_return_entries_manager.create_purchase_return_entries(return_entries, purchase_return, purchase)

            purchase_serializer = PurchaseDetailSerializer(purchase).data
            if purchase_serializer.get('bill') != None:
                bill = purchase.bill
                bill.amount_due -= decimal.Decimal(cogs)
                bill.save()
            purchase_return_account_data = journal_entries_manager.create_journal_entry(purchase_return_account, cogs, "credit")

            payment_journal_entries = purchase_return_entries_manager.purchase_return_journal_entries(purchase_serializer.get('journal_entries'), cogs)

            journal_entries_data = [purchase_return_account_data]
            journal_entries_data = journal_entries_data + payment_journal_entries
            journal_entries_manager.validate_double_entry(journal_entries_data)

            journal_entries_manager.create_journal_entries(journal_entries_data, "purcahse_return", purchase_return, AccountDetailsSerializer)

        return purchase_return