from rest_framework import serializers
from journals.models import Bill, Invoice
from datetime import datetime

class BillSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    supplier_name = serializers.SerializerMethodField(read_only=True)
    amount_paid = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    status = serializers.CharField(read_only=True)

    class Meta:
        model = Bill
        fields = ["id", "due_date", "amount_due", "supplier", "serial_number", "supplier_name", "amount_paid", "status"]
    
    def get_supplier_name(self, obj):
        return obj.supplier.name
    
class BillDetailSerializer(BillSerializer):
    bill_data = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Bill
        fields = BillSerializer.Meta.fields + ["bill_data"]
    
    def get_bill_data(self, obj):
        data = {}
        type = ''
        url = ''
        overdue_days = 0
        today = datetime.now().date()
        
        if hasattr(obj, 'journal') and obj.journal is not None:
            type = 'journal'
            url = f'journals/{obj.journal.id}/'
            
        elif hasattr(obj, 'purchase') and obj.purchase is not None:
            type = 'purchase'
            url = f'sales/{obj.purchase.id}/'
           
        if today > obj.due_date:
            overdue_days = today - obj.due_date
            overdue_days = overdue_days.days

        data = {
            "type": type,
            "url": url,
            "overdue_days": overdue_days
        }

        return data


class InvoiceSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    customer_name= serializers.SerializerMethodField(read_only=True)
    amount_paid = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    status = serializers.CharField(read_only=True)

    class Meta:
        model = Invoice
        fields = [
            "id", "due_date", "amount_due", "customer", 
            "serial_number", "customer_name", "amount_paid",
            "status"
        ]

    def get_customer_name(self, obj):
        return obj.customer.name

class InvoiceDetailSerializer(InvoiceSerializer):
    invoice_data = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Bill
        fields = BillSerializer.Meta.fields + ["invoice_data"]
   
    
    def get_invoice_data(self, obj):
        data = {}
        type = ''
        url = ''
        overdue_days = 0
        today = datetime.now().date()
        
        if hasattr(obj, 'journal') and obj.journal is not None:
            type = 'journal'
            url = f'journals/{obj.journal.id}/'
            
        elif hasattr(obj, 'sales') and obj.sales is not None:
            type = 'sales'
            url = f'sales/{obj.sales.id}/'
           
        if today > obj.due_date:
            overdue_days = today - obj.due_date
            overdue_days = overdue_days.days

        data = {
            "type": type,
            "url": url,
            "overdue_days": overdue_days
        }

        return data

        
            
