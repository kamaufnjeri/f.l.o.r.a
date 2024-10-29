from rest_framework import serializers
from journals.models import Bill, Journal, Purchase, Account, Supplier, Discount
from .journal import JournalSerializer
from .bill_invoice import BillSerializer
from .journal_entries import JournalEntrySerializer
from rest_framework.exceptions import NotFound
from .purchase import PurchaseSerializer
from .account import AccountDetailsSerializer
from journals.utils import JournalEntriesManager, PurchaseEntriesManager
from django.db import transaction

journal_entries_manager = JournalEntriesManager()
purchase_entries_manager = PurchaseEntriesManager()



class JournalBillSerializer(JournalSerializer):
    bill = BillSerializer(write_only=True)

    class Meta:
        model = Journal
        fields = JournalSerializer.Meta.fields

    def validate(self, data):
        journal_entries = data.get('journal_entries')
        journal_entries_manager.validate_journal_entries(journal_entries)
        return data
    
    def create(self, validated_data):
        print(validated_data)

        with transaction.atomic():
            journal_entries = validated_data.pop('journal_entries')
            bill = validated_data.pop('bill')
            supplier_id = bill.get('supplier')
            try:
                supplier = Supplier.objects.get(id=supplier_id.id)
            except Supplier.DoesNotExist:
                raise serializers.ValidationError(f"Supplier with ID {supplier_id} not found")
            bill['supplier'] = supplier
            amount_due = bill.get('amount_due')
            journal = Journal.objects.create(**validated_data)

            bill = Bill.objects.create(journal=journal, total_amount=amount_due, status="unpaid", organisation=validated_data.get('organisation'), user=validated_data.get('user'), **bill)

            account = supplier.account

            journal_entries.append({
                "amount": amount_due,
                "debit_credit": "credit",
                "account": account.id
            })
            journal_entries_manager.create_journal_entries(journal_entries, "journal", journal, AccountDetailsSerializer)

        return journal

class PurchaseBillSerializer(PurchaseSerializer):
    journal_entries = JournalEntrySerializer(many=True, required=False)

    class Meta:
        model = Purchase
        fields = PurchaseSerializer.Meta.fields

    def validate(self, data):
        purchase_entries = data.get('purchase_entries')
        purchase_entries_manager.validate_purchase_entries(purchase_entries)
        return data
    
    def create(self, validated_data):
        with transaction.atomic():
            journal_entries = []
            purchase_entries_data = validated_data.pop('purchase_entries')
            bill = validated_data.pop('bill')
            discount_received = validated_data.pop('discount_received')
            supplier_id = bill.get('supplier')
            try:
                supplier = Supplier.objects.get(id=supplier_id.id)
            except Supplier.DoesNotExist:
                raise serializers.ValidationError(f"Supplier with ID {supplier_id} not found")
            purchase = Purchase.objects.create(**validated_data)
            try:
                purchase_account = Account.objects.get(name="Purchase", organisation=validated_data.get('organisation'))
            except Account.DoesNotExist:
                raise serializers.ValidationError('Purchase Account not found')
            
            if discount_received.get('discount_amount') > 0.00 and discount_received.get('discount_percentage') > 0.00:
                discount = Discount.objects.create(purchase=purchase, discount_type='purchase', **discount_received)
                try:
                    discount_account = Account.objects.get(name='Discount Received', organisation_id=validated_data.get('organisation'))
                except Account.DoesNotExist:
                    raise NotFound('Discount Received account not found')
                discount_account_data = journal_entries_manager.create_journal_entry(discount_account, discount.discount_amount, 'credit')
                journal_entries.append(discount_account_data)
            bill['supplier'] = supplier
            amount_due = bill.get('amount_due')

            payables_account = supplier.account

            bill = Bill.objects.create(purchase=purchase, total_amount=amount_due, organisation=validated_data.get('organisation'), user=validated_data.get('user'), status="unpaid", **bill)
            cogs = purchase_entries_manager.create_purchase_entries(purchase_entries_data, purchase)
            purchase_account_data = journal_entries_manager.create_journal_entry(purchase_account, cogs, "debit")
            payables_account_data = journal_entries_manager.create_journal_entry(payables_account, amount_due, "credit")
            journal_entries.append(payables_account_data)
            journal_entries.append(purchase_account_data)
            journal_entries_manager.validate_double_entry(journal_entries)
            journal_entries_manager.create_journal_entries(journal_entries, "purchase", purchase, AccountDetailsSerializer)

        return purchase