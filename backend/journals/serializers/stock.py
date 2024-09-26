from rest_framework import serializers, exceptions
from django.db import transaction
from journals.models import Stock, PurchaseEntries
from datetime import date
from .purchase_entries import PurchaseEntriesSerializer


class StockSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    opening_stock_rate = serializers.DecimalField(max_digits=15, decimal_places=2, required=False, write_only=True)
    opening_stock_quantity = serializers.IntegerField(required=False, write_only=True)
    total_quantity = serializers.SerializerMethodField(read_only=True)


    class Meta:
        model = Stock
        fields = ['id', 'name', 'unit_name', 'unit_alias', 'opening_stock_quantity', 'opening_stock_rate', 'total_quantity']

    
    def get_total_quantity(self, obj):
        purchase_entries = PurchaseEntries.objects.filter(
            stock=obj,
            remaining_quantity__gt=0
        ).order_by('purchase__date')
        total_quantity = sum(entry.remaining_quantity for entry in purchase_entries)
        return total_quantity
    def validate(self, data):
        opening_stock_quantity = data.get('opening_stock_quantity')
        opening_stock_rate = data.get('opening_stock_rate')

        if (opening_stock_quantity and not opening_stock_rate) or (
            opening_stock_rate and not opening_stock_quantity
        ):
            raise serializers.ValidationError(
                f'Both opening stock quantity and opening stock rate must be given'
            )
        
        return data
        
    def create(self, validated_data):
        try:
            with transaction.atomic():
                stock = Stock.objects.create(**validated_data)

                if stock.opening_stock_quantity > 0:
                    purchase_entry_data = {
                            'purchased_quantity': stock.opening_stock_quantity,
                            'purchase_price': stock.opening_stock_rate,
                            'stock': stock,
                            'cogs': (stock.opening_stock_rate * stock.opening_stock_quantity),
                            'remaining_quantity': stock.opening_stock_quantity
                        }
                        

                    PurchaseEntries.objects.create(**purchase_entry_data)

                return stock
        except Exception as e:
            raise Exception(str(e))
            
class StockDetailsSerializer(StockSerializer):
    purchase_entries = serializers.SerializerMethodField(read_only=True)
    opening_stock_rate = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    opening_stock_quantity = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Stock
        fields = StockSerializer.Meta.fields + ['purchase_entries']

   
    
    def get_purchase_entries(self, obj):
        purchase_entries = PurchaseEntries.objects.filter(
            stock=obj,
            remaining_quantity__gt=0  
        ).order_by('purchase__date')  

        serializer = PurchaseEntriesSerializer(purchase_entries, many=True)
        return serializer.data