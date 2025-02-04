from rest_framework import serializers
from django.core.exceptions import ValidationError
from journals.models import Sales, FloraUser, Organisation
from .stock import StockDetailsSerializer
from .journal_entries import JournalEntrySerializer
from .sales_entries import SalesEntriesSerializer
from .bill_invoice import InvoiceSerializer
from journals.utils import JournalEntriesManager, SalesEntriesManager
from django.db import transaction
from datetime import datetime


sales_entries_manager = SalesEntriesManager()
journal_entries_manager = JournalEntriesManager()


class SalesSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    sales_entries = SalesEntriesSerializer(many=True)
    journal_entries = JournalEntrySerializer(many=True)
    details = serializers.SerializerMethodField(read_only=True)
    user = serializers.PrimaryKeyRelatedField(queryset=FloraUser.objects.all())
    organisation = serializers.PrimaryKeyRelatedField(queryset=Organisation.objects.all())
    due_date = serializers.CharField(write_only=True, required=False, allow_null=True, default=None) 

    class Meta:
        model = Sales
        fields = [
            'id', 'date', 'description', 'sales_entries',
            'journal_entries', 'due_date', 'details',
            "serial_number", 'user', 'organisation',
        ]

    def get_details(self, obj):
        sales_type = 'regular'
        sales_entries = SalesEntriesSerializer(obj.sales_entries.all(), many=True)
        items = [entry['stock_name'] for entry in sales_entries.data]
        total_amount = sum((float(entry['sales_price']) * float(entry['sold_quantity']) )for entry in SalesEntriesSerializer(obj.sales_entries.all(), many=True).data)
        total_quantity = sum(int(entry['sold_quantity'] ) for entry in SalesEntriesSerializer(obj.sales_entries.all(), many=True).data)
        amount_due = 0

        if hasattr(obj, 'invoice') and obj.invoice is not None:
            amount_due = obj.invoice.amount_due
            sales_type = 'invoice'

        return {
            "items": items,
            "total_amount": total_amount,
            "total_quantity": total_quantity,
            "type": sales_type,
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
                raise serializers.ValidationError("'Due date' must be after the sales date.")
        
        return value

    def validate(self, data):
        sales_entries = data.get('sales_entries')
        journal_entries = data.get('journal_entries')
        sales_entries_manager.validate_sales_entries(sales_entries)
        journal_entries_manager.validate_journal_entries(journal_entries)
        journal_entries_manager.validate_double_entry(journal_entries)

        
        return data

    def create(self, validated_data):
        with transaction.atomic():
            sales_entries = validated_data.pop('sales_entries')
            journal_entries = validated_data.pop('journal_entries')
            due_date = validated_data.pop('due_date', None)

            sales = Sales.objects.create(**validated_data)

            total_sales_price = sales_entries_manager.create_sales_entries(
                sales_entries=sales_entries, sales=sales
            )


            journal_entries_manager.create_journal_entries(
                journal_entries_data=journal_entries,
                type="sales",
                table=sales,
                total_amount=total_sales_price,
                due_date=due_date,
            )

        return sales


class SalesDetailSerializer(SalesSerializer):
    invoice = InvoiceSerializer(read_only=True)

    
    class Meta:
        model = Sales
        fields = SalesSerializer.Meta.fields + ["invoice"]
    
    def get_details(self, obj):
        sales_type = 'regular'
        total_amount = sum((float(entry['sales_price']) * float(entry['sold_quantity'])) for entry in SalesEntriesSerializer(obj.sales_entries.all(), many=True).data)
        total_quantity = sum(int(entry['sold_quantity'] ) for entry in SalesEntriesSerializer(obj.sales_entries.all(), many=True).data)
        amount_paid = 0
        amount_due = 0

        footer_data = {}

        has_returns = False
        returns_total = 0

        if hasattr(obj, 'sales_returns'):
            sales_returns = obj.sales_returns.all()
            
            if sales_returns:
                returns_total = sum(float(return_item.return_total) for return_item in sales_returns)  

                if returns_total > 0:
                    footer_data['Returns'] = returns_total
                    has_returns = True

        for entry in JournalEntrySerializer(obj.journal_entries.all(), many=True).data:
            if entry.get('debit_credit') == 'debit':
                if entry.get('type') == 'discount':
                    footer_data['Discount'] = entry.get('amount') 
                if entry.get('type') == 'payment':
                    amount_paid += float(entry.get('amount'))

        if hasattr(obj, 'invoice') and obj.invoice is not None:
            amount_due += float(obj.invoice.amount_due)
            amount_paid += float(obj.invoice.amount_paid)
            
            sales_type = 'invoice'
        amount_paid -= returns_total
        if amount_paid > 0:
            footer_data['Amount Paid'] = round(amount_paid, 2)

        if amount_due > 0:
            footer_data["Amount Due"] = amount_due
        footer_data['Total'] = total_amount

        return {
            "type": sales_type,
            "has_returns": has_returns,
            "footer_data": footer_data,
            "total_amount": total_amount,
            "total_quantity": total_quantity,
        }

    def to_representation(self, instance):
        data = super().to_representation(instance)

        journal_entries = data.get('journal_entries', [])
        sorted_journal_entries = sorted(
            journal_entries, key=lambda entry: entry.get('debit_credit') == 'credit'
        )

        debit_total = sum(
            float(entry.get('amount')) for entry in sorted_journal_entries if entry.get('debit_credit') == 'debit'
        )
        credit_total = sum(
            float(entry.get('amount')) for entry in sorted_journal_entries if entry.get('debit_credit') == 'credit'
        )

        data['journal_entries'] = sorted_journal_entries
        data['journal_entries_total'] = {
            "debit_total": debit_total,
            "credit_total": credit_total,
        }

        return data

    def update(self, instance, validated_data):
        with transaction.atomic():
            sales_entries_data = validated_data.pop('sales_entries')
            due_date = validated_data.pop('due_date')
            journal_entries_data = validated_data.pop('journal_entries')
            sales = instance
     
            cogs, sales_entries_id = sales_entries_manager.update_sales_entries(sales_entries_data, sales)
            sales.date = validated_data.get('date', sales.date)
            sales.description = validated_data.get('description', sales.description)
            entries_id = journal_entries_manager.update_journal_entries(
                journal_entries_data=journal_entries_data,
                type="sales",
                table=sales,
                total_amount=cogs,
                due_date=due_date
            )
            sales.journal_entries.exclude(id__in=entries_id).delete()
            sales.sales_entries.exclude(id__in=sales_entries_id).delete()
            sales.save()
        return sales
        
