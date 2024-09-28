from rest_framework import serializers
from journals.models import JournalEntries


class JournalEntrySerializer(serializers.ModelSerializer):
    journal = serializers.CharField(write_only=True, required=False)
    id = serializers.CharField(read_only=True)
    account_name = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        fields = ["account", "journal", "id", "amount", "debit_credit", "account_name"]
        model = JournalEntries

    def get_account_name(self, obj):
        return obj.account.name