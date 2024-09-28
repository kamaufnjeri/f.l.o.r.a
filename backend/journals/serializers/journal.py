from rest_framework import serializers
from .journal_entries import JournalEntrySerializer
from journals.models import Journal
from .account import AccountDetailsSerializer
from .bill_invoice import InvoiceSerializer, BillSerializer
from journals.utils import JournalEntriesManager
from django.db import transaction

journal_entries_manager = JournalEntriesManager()

class JournalSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    journal_entries = JournalEntrySerializer(many=True)
    bill = BillSerializer(required=False, write_only=True)
    invoice = InvoiceSerializer(required=False, write_only=True)
    type = serializers.SerializerMethodField(read_only=True)

    class Meta:
        fields = ['id', "date", "description", "journal_entries", "serial_number", "invoice", "bill", "type"]
        model = Journal

    def to_representation(self, instance):
        data = super().to_representation(instance)
        
        journal_entries = data.get('journal_entries', [])
        
        # Sort journal_entries with a key function
        sorted_journal_entries = sorted(journal_entries, key=lambda entry: entry.get('debit_credit') == 'credit')
        
        # You might want to update the data with the sorted entries
        data['journal_entries'] = sorted_journal_entries
        
        print(sorted_journal_entries)

        return data

    
    def get_type(self, obj):
        if hasattr(obj, 'invoice') and obj.invoice is not None:
            return 'invoice'
        elif hasattr(obj, 'bill') and obj.bill is not None:
            return 'bill'
        return 'regular'
        
    def validate(self, data):
        journal_entries = data.get('journal_entries')
        journal_entries_manager.validate_journal_entries(journal_entries)
        journal_entries_manager.validate_double_entry(journal_entries)
        return data
    

    def create(self, validated_data):
        with transaction.atomic():
            journal_entries_data = validated_data.pop('journal_entries')
            journal = Journal.objects.create(**validated_data)

            journal_entries_manager.create_journal_entries(journal_entries_data, "journal", journal, AccountDetailsSerializer)

        return journal
    
