from journals.models import Journal
from journals.utils import JournalEntriesManager
from django.db import transaction
from .journal import JournalSerializer


journal_entries_manager = JournalEntriesManager()



class JournalDetailSerializer(JournalSerializer):
   
    class Meta:
        fields = JournalSerializer.Meta.fields
        model = Journal

    def validate(self, data):
        journal_entries = data.get('journal_entries')
        journal_entries_manager.validate_journal_entries(journal_entries)
        journal_entries_manager.validate_double_entry(journal_entries)
        return data
    
    def update(self, instance, validated_data):
        with transaction.atomic():
            
            journal_entries_data = validated_data.pop('journal_entries')
            journal = instance

            journal.date = validated_data.get('date', journal.date)
            journal.description = validated_data.get('description', journal.description)
            entries_id = journal_entries_manager.update_journal_entries(journal_entries_data, "journal", journal)
            journal.journal_entries.exclude(id__in=entries_id).delete()
            journal.save()

        return journal

    