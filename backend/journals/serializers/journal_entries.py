from rest_framework import serializers
from journals.models import JournalEntries


class JournalEntrySerializer(serializers.ModelSerializer):
    journal = serializers.CharField(write_only=True, required=False)
    id = serializers.CharField(required=False)
    account_name = serializers.SerializerMethodField(read_only=True)
    type = serializers.CharField(required=False) 


    class Meta:
        model = JournalEntries
        fields = ["account", "journal", "id", "amount", "debit_credit", "account_name", "type"]

    def get_account_name(self, obj):
        return obj.account.name if obj.account else None

    def validate_type(self, value):
        allowed_types = ["payment", "discount", "bill", "purchase", "sales", "service_income", "invoice", "journal"]
        if value not in allowed_types:
            raise serializers.ValidationError(f"Invalid type. Must be one of {allowed_types}.")
        return value

    
    
    
class DetailedJournalEntryEntrySerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = JournalEntries
        fields = ["amount", "debit_credit", "details", "id"]

    def get_details(self, obj):
        from journals.utils import get_date_description_type_url
        details = get_date_description_type_url(obj)

        return details