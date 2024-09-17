from rest_framework import serializers
from .journal_entries import JournalEntrySerializer
from journals.models import Payment, Bill, Invoice
from journals.utils import JournalEntriesManager
from django.db import transaction
from .account import AccountDetailsSerializer

journal_entries_manager = JournalEntriesManager()

class PaymentSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    bill = serializers.CharField(write_only=True, required=False, allow_null=True)
    invoice = serializers.CharField(write_only=True, required=False, allow_null=True)
    
    journal_entries = JournalEntrySerializer(many=True)

    class Meta:
        model = Payment
        fields = ['id', 'date', 'description', "amount_paid", 'bill', 'invoice', 'journal_entries']

    def validate(self, data):
        journal_entries= data.get('journal_entries')
        journal_entries_manager.validate_journal_entries(journal_entries)
        return data

    def create(self, validated_data):
        with transaction.atomic():
            journal_entries_data = validated_data.pop("journal_entries")
            bill_id = validated_data.get("bill")
            invoice_id = validated_data.get("invoice")
            amount_paid = validated_data.get("amount_paid")

            # Validation to ensure only one of bill_id or invoice_id is provided
            if invoice_id and bill_id:
                raise serializers.ValidationError("Only one invoice or bill can be paid at a time")

            # Creating Payment instance
            payment = None
            
            account_data = {}

            if bill_id:
                try:
                    bill = Bill.objects.get(id=bill_id)
                except Bill.DoesNotExist:
                    raise serializers.ValidationError(f"Bill with id {bill_id} not found")
                validated_data['bill'] = bill
                account = bill.supplier.account
                bill.amount_paid += amount_paid
                bill.amount_due -= amount_paid

                # Update the status of the bill
                bill.status = "paid" if bill.amount_due <= 0 else "partially_paid"
                bill.save()
                account_data = {
                    "amount": amount_paid,
                    "debit_credit": "debit",
                    "account": account.id
                }

            if invoice_id:
                try:
                    invoice = Invoice.objects.get(id=invoice_id)
                except Invoice.DoesNotExist:
                    raise serializers.ValidationError(f"Invoice with ID {invoice_id} not found")
                validated_data['invoice'] = invoice
                account = invoice.customer.account
                invoice.amount_paid += amount_paid
                invoice.amount_due -= amount_paid

                # Update the status of the invoice
                invoice.status = "paid" if invoice.amount_paid >= invoice.total_amount else "partially_paid"
                invoice.save()
                account_data = {
                    "amount": amount_paid,
                    "debit_credit": "credit",
                    "account": account.id
                }
            
            payment = Payment.objects.create(**validated_data)

            # Add the account_data to journal_entries_data
            journal_entries_data.append(account_data)
            journal_entries_manager.validate_double_entry(journal_entries_data)
            journal_entries_manager.create_journal_entries(journal_entries_data, "payments", payment, AccountDetailsSerializer)
        return payment

