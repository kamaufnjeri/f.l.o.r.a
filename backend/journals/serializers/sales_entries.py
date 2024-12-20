from rest_framework import serializers
from journals.models import SalesEntries


class SalesEntriesSerializer(serializers.ModelSerializer):
    id = serializers.CharField(required=False)
    sales = serializers.CharField(write_only=True, required=False)
    remaining_quantity = serializers.IntegerField(read_only=True)
    stock_name = serializers.SerializerMethodField(read_only=True)
    quantity = serializers.SerializerMethodField(read_only=True)
    total_sales_price = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = SalesEntries
        fields = "__all__"

    def get_stock_name(self, obj):
        return obj.stock.name
    
    def get_quantity(self, obj):
        return f"{obj.sold_quantity} {obj.stock.unit_alias}"
    def get_total_sales_price(self, obj):
        return float(obj.sold_quantity) * float(obj.sales_price)
    

class DetailedSalesEntriesSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
   
    details = serializers.SerializerMethodField(read_only=True)
    

    class Meta:
        model = SalesEntries
        fields = ['id', 'details']

    
    def get_details(self, obj):
        from journals.utils import get_date_description_type_url
        details = get_date_description_type_url(obj)
        details['quantity'] = obj.sold_quantity
        details['rate'] = obj.sales_price
        details['total'] = float(obj.sales_price) * float(obj.sold_quantity)

        return details