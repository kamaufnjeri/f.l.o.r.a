from rest_framework import serializers
from .purchase_entries import PurchaseEntriesSerializer
from .journal_entries import JournalEntrySerializer
from .bill_invoice import BillSerializer
from journals.models import Purchase, FloraUser, Organisation
from django.db import transaction
from journals.utils import PurchaseEntriesManager, JournalEntriesManager
from datetime import datetime

purchase_entries_manager = PurchaseEntriesManager()
journal_entries_manager = JournalEntriesManager()


class PurchaseSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    purchase_entries = PurchaseEntriesSerializer(many=True)
    journal_entries = JournalEntrySerializer(many=True)
    details = serializers.SerializerMethodField(read_only=True)
    due_date = serializers.CharField(write_only=True, required=False, allow_null=True, default=None) 
    user = serializers.PrimaryKeyRelatedField(queryset=FloraUser.objects.all())
    organisation = serializers.PrimaryKeyRelatedField(queryset=Organisation.objects.all())
 
    class Meta:
        model = Purchase
        fields = [
            'id', 'date', 'description', 'purchase_entries', 
            'journal_entries', 'details', 'due_date',
            'serial_number', 'user', 'organisation'
        ]

    def get_details(self, obj):
        purchase_type = 'regular'
        purchase_entries = PurchaseEntriesSerializer(obj.purchase_entries.all(), many=True)
        items = [entry['stock_name'] for entry in purchase_entries.data]
        total_amount = sum((float(entry['purchase_price']) * float(entry['purchased_quantity']) )for entry in PurchaseEntriesSerializer(obj.purchase_entries.all(), many=True).data)
        total_quantity = sum(int(entry['purchased_quantity'] ) for entry in PurchaseEntriesSerializer(obj.purchase_entries.all(), many=True).data)
        amount_due = 0

        if hasattr(obj, 'bill') and obj.bill is not None:
            amount_due = obj.bill.amount_due
            purchase_type = 'bill'

        return {
            "items": items,
            "total_amount": total_amount,
            "total_quantity": total_quantity,
            "type": purchase_type,
            "amount_due": amount_due,
        }

        

    def validate_due_date(self, value):
        """
        Validate the due_date field.
        """
        if value:
            date = self.initial_data.get('date')

            if isinstance(date, str):
                date = datetime.strptime(date, '%Y-%m-%d').date()
                value = datetime.strptime(value, '%Y-%m-%d').date()
            if value < date:
                raise serializers.ValidationError("'Due date' must be after the purchase date.")
        
        return value

    def validate(self, data):
        purchase_entries = data.get('purchase_entries')
        journal_entries = data.get('journal_entries')

        purchase_entries_manager.validate_purchase_entries(purchase_entries)
        journal_entries_manager.validate_journal_entries(journal_entries)
        journal_entries_manager.validate_double_entry(journal_entries)

        return data
    
    def create(self, validated_data):
        with transaction.atomic():
            purchase_entries_data = validated_data.pop('purchase_entries')
            due_date = validated_data.pop('due_date')
            journal_entries = validated_data.pop('journal_entries')
            purchase = Purchase.objects.create(**validated_data)
            cogs = purchase_entries_manager.create_purchase_entries(purchase_entries_data, purchase)
            journal_entries_manager.create_journal_entries(
                journal_entries_data=journal_entries, 
                type="purchase", 
                table=purchase, 
                total_amount=cogs, 
                due_date=due_date
            )
        return purchase
    

class PurchaseDetailSerializer(PurchaseSerializer):
    bill = BillSerializer(read_only=True)

    class Meta:
        model = Purchase
        fields = PurchaseSerializer.Meta.fields + ["bill"]

    

    def get_details(self, obj):
        purchase_type = 'regular'
        total_amount = sum((float(entry['purchase_price']) * float(entry['purchased_quantity'])) for entry in PurchaseEntriesSerializer(obj.purchase_entries.all(), many=True).data)
        total_quantity = sum(int(entry['purchased_quantity'] ) for entry in PurchaseEntriesSerializer(obj.purchase_entries.all(), many=True).data)
        amount_paid = 0
        amount_due = 0

        footer_data = {}


        has_returns = False
        returns_total = 0

        if hasattr(obj, 'purchase_returns'):
            purchase_returns = obj.purchase_returns.all()
            
            if purchase_returns:
                returns_total = sum(float(return_item.return_total) for return_item in purchase_returns)  

                if returns_total > 0:
                    footer_data['Returns'] = returns_total
                    has_returns = True

        for entry in JournalEntrySerializer(obj.journal_entries.all(), many=True).data:
            if entry.get('debit_credit') == 'credit':
                if entry.get('type') == 'discount':
                    footer_data['Discount'] = entry.get('amount') 
                if entry.get('type') == 'payment':
                    amount_paid += float(entry.get('amount'))

        if hasattr(obj, 'bill') and obj.bill is not None:
            amount_due += float(obj.bill.amount_due)
            amount_paid += float(obj.bill.amount_paid)
            purchase_type = 'bill'

            
        amount_paid -= returns_total

        if amount_paid > 0:
            footer_data['Amount Paid'] = round(amount_paid, 2)
        if amount_due > 0:
            footer_data["Amount Due"] = amount_due
        footer_data['Total'] = total_amount

        return {
            "type": purchase_type,
            "has_returns": has_returns,
            "footer_data": footer_data,
            "total_amount": total_amount,
            "total_quantity": total_quantity,
        }

    def to_representation(self, instance):
        data = super().to_representation(instance)
        
        journal_entries = data.get('journal_entries', [])
        
        sorted_journal_entries = sorted(
            journal_entries, 
            key=lambda entry: entry.get('debit_credit') == 'credit'
        )
        
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
            purchase_entries_data = validated_data.pop('purchase_entries')
            due_date = validated_data.pop('due_date')
            journal_entries_data = validated_data.pop('journal_entries')
            purchase = instance
     
            cogs, purchase_entries_id = purchase_entries_manager.update_purchase_entries(purchase_entries_data, purchase)
            purchase.date = validated_data.get('date', purchase.date)
            purchase.description = validated_data.get('description', purchase.description)
            entries_id = journal_entries_manager.update_journal_entries(
                journal_entries_data=journal_entries_data,
                type="purchase",
                table=purchase,
                total_amount=cogs,
                due_date=due_date
            )
            purchase.journal_entries.exclude(id__in=entries_id).delete()
            purchase.purchase_entries.exclude(id__in=purchase_entries_id).delete()
            purchase.save()
        return purchase
        
