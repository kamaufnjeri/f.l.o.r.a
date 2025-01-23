from rest_framework import serializers
from .journal_entries import JournalEntrySerializer
from journals.models import Payment, Bill, Invoice, FloraUser, Organisation
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
    journal_entries = JournalEntrySerializer(many=True, write_only=True)
    details = serializers.SerializerMethodField(read_only=True)
    user = serializers.PrimaryKeyRelatedField(queryset=FloraUser.objects.all())
    organisation = serializers.PrimaryKeyRelatedField(queryset=Organisation.objects.all())

    class Meta:
        model = Payment
        fields = ['id', 'date', 'description', "amount_paid", 'bill', 'invoice', 'journal_entries', 'details', "user", "organisation"]

    def get_details(self, obj):
        type = ''
        url = ''
        serial_number = ''

        if hasattr(obj, 'invoice') and obj.invoice is not None:
            type = 'invoice'
            serial_number = InvoiceDetailSerializer(obj.invoice).data.get("details").get("serial_number")
            url = InvoiceDetailSerializer(obj.invoice).data.get("details").get("url")
        elif hasattr(obj, 'bill') and obj.bill is not None:
            type = 'bill'
            serial_number = BillDetailSerializer(obj.bill).data.get("details").get("serial_number")
            url = BillDetailSerializer(obj.bill).data.get("details").get("url")
        
        data = {
            "type": type,
            "serial_number": serial_number,
            "url": url
        }
    
        return data
    
   
    def create(self, validated_data):
        with transaction.atomic():

            journal_entries_data = validated_data.pop("journal_entries")

            bill_id = validated_data.get("bill")
            invoice_id = validated_data.get("invoice")

            amount_paid = sum(entry.get("amount") for entry in journal_entries_data if entry.get('type') == 'payment')

            if invoice_id and bill_id:
                raise serializers.ValidationError("Only one invoice or bill can be paid at a time")
            
            print(invoice_id, bill_id)

            if bill_id is None and invoice_id is None:
                raise serializers.ValidationError("Invoice or bill id is needed")



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
                    "account": account.id,
                    "type": "bill"
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
                    "account": account.id,
                    "type": "invoice"
                }
            
            payment = Payment.objects.create(**validated_data, amount_paid=amount_paid)

            journal_entries_data.append(account_data)

            journal_entries_manager.validate_double_entry(journal_entries_data)
            journal_entries_manager.create_journal_entries(journal_entries_data, "payments", payment, AccountDetailsSerializer)
        return payment


class PaymentsDetailSerializer(PaymentSerializer):
    journal_entries = JournalEntrySerializer(many=True)

    class Meta:
        model = Payment
        fields = PaymentSerializer.Meta.fields

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
    
    def validate(self, data):
        journal_entries = data.get('journal_entries')
        journal_entries_manager.validate_journal_entries(journal_entries)
        journal_entries_manager.validate_double_entry(journal_entries)
        return data
    

    def update(self, instance, validated_data):
        with transaction.atomic():
            journal_entries_data = validated_data.pop('journal_entries')
            payment = instance
            old_amount_paid = payment.amount_paid

            bill_invoice = getattr(payment, 'bill', None) or getattr(payment, 'invoice', None)
            new_amount_paid = sum(entry.get("amount") for entry in journal_entries_data if entry.get('type') == 'payment')

            if bill_invoice:
                new_total_amount_paid = float(bill_invoice.amount_paid) - float(old_amount_paid) + float(new_amount_paid)

                if new_total_amount_paid > bill_invoice.total_amount:
                    raise serializers.ValidationError("Amount to be paid can't be more than the amount due.")
                if new_total_amount_paid < 0:
                    raise serializers.ValidationError("Total amount paid cannot be less than zero.")

                bill_invoice.amount_paid = new_total_amount_paid
                bill_invoice.amount_due = float(bill_invoice.total_amount) - new_total_amount_paid

                if new_total_amount_paid <= 0:
                    bill_invoice.status = "unpaid"
                elif 0 < new_total_amount_paid < bill_invoice.total_amount:
                    bill_invoice.status = "partially_paid"
                elif new_total_amount_paid >= bill_invoice.total_amount:
                    bill_invoice.status = "paid"

                bill_invoice.save()

            payment.date = validated_data.get('date', payment.date)
            payment.amount_paid = new_amount_paid
            payment.description = validated_data.get('description', payment.description)

            entries_id = journal_entries_manager.update_journal_entries(journal_entries_data, "payments", payment)
            if entries_id:
                payment.journal_entries.exclude(id__in=entries_id).delete()

            payment.save()

        return payment
