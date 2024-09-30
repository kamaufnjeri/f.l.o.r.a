from rest_framework import serializers
from journals.models import Bill, Invoice

class BillSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    supplier_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Bill
        fields = ["id", "due_date", "amount_due", "supplier", "serial_number", "supplier_name"]
    
    def get_supplier_name(self, obj):
        return obj.supplier.name

class InvoiceSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    customer_name= serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Invoice
        fields = ["id", "due_date", "amount_due", "customer", "serial_number", "customer_name"]

    def get_customer_name(self, obj):
        return obj.customer.name