from rest_framework import serializers
from journals.models import AuditTrail


class AuditTrailSerializer(serializers.ModelSerializer):
    changed_by_name = serializers.SerializerMethodField()
    organisation_name = serializers.SerializerMethodField()
    date_time = serializers.SerializerMethodField()

    class Meta:
        model = AuditTrail
        fields = [
            'id',
            'action',
            'model_name',
            'object_id',
            'before',
            'after',
            'created_at',
            'changed_by',
            'changed_by_name',
            'organisation',
            'organisation_name',
            'date_time'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_date_time(self, obj):
        return f"{obj.created_at.month}/{obj.created_at.day}/{obj.created_at.year}, {obj.created_at.strftime('%I:%M:%S %p').lstrip('0')}"


    def get_changed_by_name(self, obj):
        if obj.changed_by:
            return f'{obj.changed_by.get_full_name()} - {obj.changed_by.email}' or str(obj.changed_by)
        return None

    def get_organisation_name(self, obj):
        if obj.organisation:
            return f"{obj.organisation.org_name} - {obj.organisation.org_email}"
        return None
