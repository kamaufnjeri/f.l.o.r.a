from rest_framework import serializers
from journals.models import Bill, Invoice

class BillSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)

    class Meta:
        model = Bill
        fields = ["id", "due_date", "amount_due", "supplier"]

class InvoiceSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    class Meta:
        model = Invoice
        fields = ["id", "due_date", "amount_due", "customer"]