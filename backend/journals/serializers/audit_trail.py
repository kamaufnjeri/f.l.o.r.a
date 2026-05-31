from rest_framework import serializers
from journals.models import AuditTrail

class AuditTrailSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditTrail
        fields = ['id', 'action', 'model_name', 'object_id', 'before', 'after', 'created_at', 'changed_by', 'organisation']
        read_only_fields = ['id', 'created_at']  
