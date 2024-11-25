from rest_framework import serializers
from journals.models import JournalEntries
from journals.models import Journal, FloraUser, Organisation
from journals.utils import JournalEntriesManager
from django.db import transaction
from .journal import JournalSerializer


journal_entries_manager = JournalEntriesManager()


from rest_framework import serializers
from journals.models import JournalEntries

class JournalEntrySerializer(serializers.ModelSerializer):
    journal = serializers.CharField(write_only=True, required=False)
    id = serializers.CharField(read_only=True, required=False)
    delete = serializers.BooleanField(default=False)
    
    class Meta:
        fields = ["account", "journal", "id", "amount", "debit_credit", "delete"]
        model = JournalEntries

    def get_delete(self, obj):
       
        return False  


class JournalDetailSerializer(JournalSerializer):
   
    class Meta:
        fields = JournalSerializer.Meta.fields
        model = Journal

    def validate(self, data):
        journal_entries = data.get('journal_entries')
        journal_entries_manager.validate_update_journal_entries(journal_entries)
        journal_entries_manager.validate_double_entry(journal_entries)
        return data
    
    def update(self, instance, validated_data):
        with transaction.atomic():
            
            journal_entries_data = validated_data.pop('journal_entries')
            journal = instance

            journal.date = validated_data.get('date', journal.date)
            journal.description = validated_data.get('description', journal.description)
            journal.save()

            journal.journal_entries.all().delete()

            journal_entries_manager.update_journal_entries(journal_entries_data, "journal", journal)

        return journal

    