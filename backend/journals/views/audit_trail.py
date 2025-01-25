from rest_framework import views
from journals.models import AuditTrail
from journals.serializers import AuditTrailSerializer


class AuditTrailAPIView(views.APIView):
    queryset = AuditTrail.objects.all()  # Retrieve all AuditTrail entries
    serializer_class = AuditTrailSerializer  # Use the serializer we just created
    filter_fields = ['model_name', 'action', 'object_id']  # Optional: to filter by action or model
    ordering_fields = ['created_at']  # Optionally order by the created_at field
    search_fields = ['model_name', 'action', 'object_id']  # Enable search functionality on fields
