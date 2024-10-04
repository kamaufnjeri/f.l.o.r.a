from rest_framework import serializers
from .journal_entries import JournalEntrySerializer
from journals.models import Payment, Bill, Invoice
from journals.utils import JournalEntriesManager
from django.db import transaction
from .bill_invoice import BillDetailSerializer, InvoiceDetailSerializer
from .account import AccountDetailsSerializer

journal_entries_manager = JournalEntriesManager()

class PaymentSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    bill = serializers.CharField(write_only=True, required=False, allow_null=True)
    invoice = serializers.CharField(write_only=True, required=False, allow_null=True)
    amount_paid = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    journal_entries = JournalEntrySerializer(many=True)
    payment_data = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Payment
        fields = ['id', 'date', 'description', "amount_paid", 'bill', 'invoice', 'journal_entries', 'payment_data']

    def get_payment_data(self, obj):
        type = ''
        url = ''
        bill_no = ''
        invoice_no = ''
        if hasattr(obj, 'invoice') and obj.invoice is not None:
            type = 'invoice'
            invoice_no = obj.invoice.serial_number
            url = InvoiceDetailSerializer(obj.invoice).data.get("invoice_data").get("url")
        elif hasattr(obj, 'bill') and obj.bill is not None:
            type = 'bill'
            bill_no = obj.bill.serial_number
            url = BillDetailSerializer(obj.bill).data.get("bill_data").get("url")
        
        data = {
            "type": type,
            "bill_no": bill_no,
            "invoice_no": invoice_no,
            "url": url
        }
    
        return data
    
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

    def create(self, validated_data):
        with transaction.atomic():

            journal_entries_data = validated_data.pop("journal_entries")

            bill_id = validated_data.get("bill")
            invoice_id = validated_data.get("invoice")

            amount_paid = sum(entry.get("amount") for entry in journal_entries_data)

            if invoice_id and bill_id:
                raise serializers.ValidationError("Only one invoice or bill can be paid at a time")

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

                if bill.amount_paid > bill.total_amount:
                    raise serializers.ValidationError("Amount to be paid can't be more the amount due")

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

                if invoice.amount_paid > invoice.total_amount:
                    raise serializers.ValidationError("Amount to be paid can't be more the amount due")

                invoice.status = "paid" if invoice.amount_paid >= invoice.total_amount else "partially_paid"
                invoice.save()
                account_data = {
                    "amount": amount_paid,
                    "debit_credit": "credit",
                    "account": account.id
                }
            
            payment = Payment.objects.create(**validated_data, amount_paid=amount_paid)

            journal_entries_data.append(account_data)
            journal_entries_manager.validate_double_entry(journal_entries_data)
            journal_entries_manager.create_journal_entries(journal_entries_data, "payments", payment, AccountDetailsSerializer)
        return payment

