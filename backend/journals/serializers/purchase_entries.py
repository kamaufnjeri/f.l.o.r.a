from rest_framework import serializers
from journals.models import PurchaseEntries


class PurchaseEntriesSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    stock = serializers.CharField(write_only=True)
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