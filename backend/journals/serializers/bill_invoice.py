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
        due_days = 0
        today = datetime.now().date()
        
        if hasattr(obj, 'journal') and obj.journal is not None:
            type = 'journal'
            url = f'journals/{obj.journal.id}'
            
        elif hasattr(obj, 'purchase') and obj.purchase is not None:
            type = 'purchase'
            url = f'purchases/{obj.purchase.id}'
           
        due_diff = obj.due_date - today
        due_days = due_diff.days

        if due_days < 0 and obj.status != "paid":
            due_days = f"Overdue by {(-1 * due_days)} days"
        elif due_days > 0:
            due_days = f"{due_days} days"
        else:
            due_days = "Not due"

        data = {
            "type": type,
            "url": url,
            "due_days": due_days
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
        model =Invoice
        fields = InvoiceSerializer.Meta.fields + ["invoice_data"]
   
    
    def get_invoice_data(self, obj):
        data = {}
        type = ''
        url = ''
        due_days = 0
        today = datetime.now().date()
        
        if hasattr(obj, 'journal') and obj.journal is not None:
            type = 'journal'
            url = f'journals/{obj.journal.id}'
            
        elif hasattr(obj, 'sales') and obj.sales is not None:
            type = 'sales'
            url = f'sales/{obj.sales.id}'
           
        due_diff = obj.due_date - today
        due_days = due_diff.days

        if due_days < 0 and obj.status != "paid":
            due_days = f"Overdue by {(-1 * due_days)} days"
        elif due_days > 0:
            due_days = f"{due_days} days"
        else:
            due_days = "Not due"




        data = {
            "type": type,
            "url": url,
            "due_days": due_days
        }

        return data

        
            
