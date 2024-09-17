from rest_framework import serializers
from .journal_entries import JournalEntrySerializer
from journals.models import Journal
from .account import AccountDetailsSerializer
from journals.utils import JournalEntriesManager
from django.db import transaction

journal_entries_manager = JournalEntriesManager()

class JournalSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    journal_entries = JournalEntrySerializer(many=True)

    class Meta:
        fields = ['id', "date", "description", "journal_entries"]
        model = Journal
    
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