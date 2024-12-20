from rest_framework import serializers
from journals.models import PurchaseEntries


class PurchaseEntriesSerializer(serializers.ModelSerializer):
    id = serializers.CharField(required=False)
    purchase = serializers.CharField(write_only=True, required=False)
    remaining_quantity = serializers.IntegerField(read_only=True)
    cogs = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    stock_name = serializers.SerializerMethodField(read_only=True)
    quantity = serializers.SerializerMethodField(read_only=True)
    

    class Meta:
        model = PurchaseEntries
        fields = '__all__'

    def get_stock_name(self, obj):
        return obj.stock.name
    
    def get_quantity(self, obj):
        return f"{obj.purchased_quantity} {obj.stock.unit_alias}"
    

class DetailedPurchaseEntriesSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
   
    details = serializers.SerializerMethodField(read_only=True)
    

    class Meta:
        model = PurchaseEntries
        fields = ['id', 'details']

    
    def get_details(self, obj):
        from journals.utils import get_date_description_type_url
        details = get_date_description_type_url(obj)
        details['quantity'] = obj.purchased_quantity
        details['rate'] = obj.purchase_price
        details['total'] = float(obj.purchase_price) * float(obj.purchased_quantity)

        return details