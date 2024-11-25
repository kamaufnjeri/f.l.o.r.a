from rest_framework import serializers
from .journal_entries import JournalEntrySerializer
from journals.models import Journal, FloraUser, Organisation
from .account import AccountDetailsSerializer
from journals.utils import JournalEntriesManager
from django.db import transaction

journal_entries_manager = JournalEntriesManager()

class JournalSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    journal_entries = JournalEntrySerializer(many=True)
    user = serializers.PrimaryKeyRelatedField(queryset=FloraUser.objects.all())
    organisation = serializers.PrimaryKeyRelatedField(queryset=Organisation.objects.all())

    class Meta:
        fields = ['id', "date", "description", "journal_entries", "serial_number", "organisation", "user"]
        model = Journal

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
    

    def create(self, validated_data):
        with transaction.atomic():
            journal_entries_data = validated_data.pop('journal_entries')
            journal = Journal.objects.create(**validated_data)

            journal_entries_manager.create_journal_entries(journal_entries_data, "journal", journal)
        return journal

