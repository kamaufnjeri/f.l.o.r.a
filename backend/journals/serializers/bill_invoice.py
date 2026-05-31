from rest_framework import serializers
from journals.models import Bill, Invoice
from datetime import datetime


class BillSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    supplier_name = serializers.SerializerMethodField(read_only=True)
    amount_paid = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    status = serializers.CharField(read_only=True)
    total_amount = serializers.CharField(read_only=True)
   

    class Meta:
        model = Bill
        fields = ["id", "due_date", "amount_due", "supplier", "supplier_name", "amount_paid", "status", "total_amount"]
    
    def get_supplier_name(self, obj):
        return obj.supplier.name
    
class BillDetailSerializer(BillSerializer):
    details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Bill
        fields = BillSerializer.Meta.fields + ["details"]
    
    def get_details(self, obj):
        from journals.utils import get_date_description_type_url

        details = get_date_description_type_url(obj)
        purchase_no = obj.purchase.serial_number
        details['serial_number'] = purchase_no
        
        due_days = 0
        today = datetime.now().date()
      
        due_diff = obj.due_date - today
        due_days = due_diff.days
        if due_days < 0 and obj.status != "paid":
            due_days = f"Overdue by {(-1 * due_days)} days"
        elif due_days >= 0 and obj.status != "paid":
            due_days = f"{due_days} days"
        else:
            due_days = "Not due"

        details['due_days'] = due_days



        return details

        


class InvoiceSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    customer_name= serializers.SerializerMethodField(read_only=True)
    amount_paid = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    status = serializers.CharField(read_only=True)
    total_amount = serializers.CharField(read_only=True)

   
    class Meta:
        model = Invoice
        fields = [
            "id", "due_date", "amount_due", "customer", 
            "customer_name", "amount_paid",
            "status", "total_amount"
        ]

    def get_customer_name(self, obj):
        return obj.customer.name

class InvoiceDetailSerializer(InvoiceSerializer):
    details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model =Invoice
        fields = InvoiceSerializer.Meta.fields + ["details"]
   
    
    def get_details(self, obj):
        from journals.utils import get_date_description_type_url

        details = get_date_description_type_url(obj)
                
        due_days = 0
        today = datetime.now().date()
      
        due_diff = obj.due_date - today
        due_days = due_diff.days

        if due_days < 0 and obj.status != "paid":
            due_days = f"Overdue by {(-1 * due_days)} days"
        elif due_days > 0:
            due_days = f"{due_days} days"
        else:
            due_days = "Not due"

        details['due_days'] = due_days

        return details

        
            
