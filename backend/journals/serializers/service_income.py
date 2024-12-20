from rest_framework import serializers
from django.db import transaction
from journals.models import FloraUser, Organisation, ServiceIncomeEntry, ServiceIncome
from .journal_entries import JournalEntrySerializer
from .bill_invoice import InvoiceSerializer
from journals.utils import ServiceIncomeEntriesManager, JournalEntriesManager, get_date_description_type_url
from datetime import datetime


service_income_entries_manager = ServiceIncomeEntriesManager()
journal_entries_manager = JournalEntriesManager()


class ServiceIncomeEntrySerializer(serializers.ModelSerializer):
    id = serializers.CharField(required=False)
    service_income_total = serializers.CharField(read_only=True)
    service_income = serializers.CharField(write_only=True, required=False)
    service_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = ServiceIncomeEntry
        fields = ["id", "service", "service_income", "service_name", "price", "quantity", "service_income_total"]

    def get_service_name(self, obj):
        return obj.service.name
    

class DetailedServiceIncomeEntrySerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = ServiceIncomeEntry
        fields = ["id", "price", "quantity", "details"]

    def get_details(self, obj):
        details = get_date_description_type_url(obj)
        details['serial_number'] = obj.service_income.serial_number
        details['total'] = float(obj.price) * float(obj.quantity)

        return details

    

class ServiceIncomeSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    service_income_entries = ServiceIncomeEntrySerializer(many=True)
    journal_entries = JournalEntrySerializer(many=True)
    details = serializers.SerializerMethodField(read_only=True)
    due_date = serializers.CharField(write_only=True, required=False, allow_null=True, default=None)
    user = serializers.PrimaryKeyRelatedField(queryset=FloraUser.objects.all())
    organisation = serializers.PrimaryKeyRelatedField(queryset=Organisation.objects.all())
 
    class Meta:
        model = ServiceIncome
        fields = [
            'id', 'date', 'description', 'service_income_entries', 
            'journal_entries', 'details', 'due_date',
            'serial_number', 'user', 'organisation'
        ]

    def get_details(self, obj):
        service_income_type = 'regular'
        service_income_entries = ServiceIncomeEntrySerializer(obj.service_income_entries.all(), many=True)
        items = [entry['service_name'] for entry in service_income_entries.data]
        total_amount = sum((float(entry['price']) * float(entry['quantity']) )for entry in ServiceIncomeEntrySerializer(obj.service_income_entries.all(), many=True).data)
        total_quantity = sum(int(entry['quantity'] ) for entry in ServiceIncomeEntrySerializer(obj.service_income_entries.all(), many=True).data)
        amount_due = 0

        if hasattr(obj, 'invoice') and obj.invoice is not None:
            amount_due = obj.invoice.amount_due
            service_income_type = 'invoice'

        return {
            "items": items,
            "total_amount": total_amount,
            "total_quantity": total_quantity,
            "type": service_income_type,
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
                raise serializers.ValidationError("'due_date' must be after the purchase date.")
        
        return value
    
    

    def validate(self, data):
        service_income_entries = data.get('service_income_entries')
        journal_entries = data.get('journal_entries')

        service_income_entries_manager.validate_service_income_entries(service_income_entries)
        journal_entries_manager.validate_journal_entries(journal_entries)
        journal_entries_manager.validate_double_entry(journal_entries)

        
        return data
    
    def create(self, validated_data):
        with transaction.atomic():
            service_income_entries_data = validated_data.pop('service_income_entries')
            journal_entries = validated_data.pop('journal_entries')
            due_date = validated_data.pop('due_date', None)

            service_income = ServiceIncome.objects.create(**validated_data)

            total_service_income = service_income_entries_manager.create_service_income_entries(
                service_income_entries_data=service_income_entries_data, service_income=service_income
            )
            
            journal_entries_manager.create_journal_entries(
                journal_entries_data=journal_entries,
                type="service_income",
                table=service_income,
                total_amount=total_service_income,
                due_date=due_date,
            )

        return service_income

class ServiceIncomeDetailSerializer(ServiceIncomeSerializer):
    invoice = InvoiceSerializer(read_only=True)

    class Meta:
        model = ServiceIncome
        fields = ServiceIncomeSerializer.Meta.fields + ['invoice']

    def get_details(self, obj):
        service_income_type = 'regular'
        total_amount = sum((float(entry['price']) * float(entry['quantity'])) for entry in ServiceIncomeEntrySerializer(obj.service_income_entries.all(), many=True).data)
        total_quantity = sum(int(entry['quantity'] ) for entry in ServiceIncomeEntrySerializer(obj.service_income_entries.all(), many=True).data)
        amount_paid = 0
        amount_due = 0

        footer_data = {}

        for entry in JournalEntrySerializer(obj.journal_entries.all(), many=True).data:
            if entry.get('debit_credit') == 'debit':
                if entry.get('type') == 'payment':
                    amount_paid += float(entry.get('amount'))
                elif entry.get('type') == 'discount':
                    footer_data['Discount'] = entry.get('amount') 

        if hasattr(obj, 'invoice') and obj.invoice is not None:
            amount_due += float(obj.invoice.amount_due)
            amount_paid += float(obj.invoice.amount_paid)
            service_income_type = 'invoice'

        if amount_paid > 0:
            footer_data['Amount Paid'] = amount_paid

        if amount_due > 0:
            footer_data["Amount Due"] = amount_due
        footer_data['Total'] = total_amount

        return {
            "type": service_income_type,
            "footer_data": footer_data,
            "total_amount": total_amount,
            "total_quantity": total_quantity,
        }
 

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
    
    def update(self, instance, validated_data):
        with transaction.atomic():
            service_income_entries_data = validated_data.pop('service_income_entries')
            due_date = validated_data.pop('due_date')
            journal_entries_data = validated_data.pop('journal_entries')
            service_income = instance
     
            service_income_total, service_income_entries_id = service_income_entries_manager.update_service_income_entries(service_income_entries_data, service_income)
            service_income.date = validated_data.get('date', service_income.date)
            service_income.description = validated_data.get('description', service_income.description)
            entries_id = journal_entries_manager.update_journal_entries(
                journal_entries_data=journal_entries_data,
                type="service_income",
                table=service_income,
                total_amount=service_income_total,
                due_date=due_date
            )
            service_income.journal_entries.exclude(id__in=entries_id).delete()
            service_income.service_income_entries.exclude(id__in=service_income_entries_id).delete()
            service_income.save()
        return service_income