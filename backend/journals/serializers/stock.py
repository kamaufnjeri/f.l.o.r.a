from rest_framework import serializers, exceptions
from django.db import transaction
from journals.models import Stock, Account, PurchaseEntries
from datetime import date
from .purchase import PurchaseSerializer
from .purchase_entries import PurchaseEntriesSerializer



class StockSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    opening_stock_rate = serializers.DecimalField(max_digits=15, decimal_places=2, required=False)
    opening_stock_quantity = serializers.IntegerField(required=False)

    class Meta:
        model = Stock
        fields = ['id', 'name', 'unit_name', 'unit_alias', 'opening_stock_quantity', 'opening_stock_rate']
    
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
        with transaction.atomic():
            try:
                opening_stock_account = Account.objects.get(name='Opening Stock')
            except Account.DoesNotExist:
                raise serializers.ValidationError('Opening stock account does not exist')

            stock = Stock.objects.create(**validated_data)

            if stock.opening_stock_quantity > 0:
                opening_stock_data = {
                    'date': date.today().strftime('%Y-%m-%d'),
                    'description': f'Opening stock for {stock.name}',
                    'purchase_entries': [{
                        'purchased_quantity': stock.opening_stock_quantity,
                        'purchase_price': stock.opening_stock_rate,
                        'stock': str(stock.id)
                    }],
                    'journal_entries': [{
                        'account': opening_stock_account.id,
                        'debit_credit': 'credit',
                        'amount': stock.opening_stock_quantity * stock.opening_stock_rate,
                    }]
                }

                purchase_serializer = PurchaseSerializer(data=opening_stock_data)

                if purchase_serializer.is_valid(raise_exception=True):
                    print("Purchase data is valid.")
                    purchase_serializer.save()

            return stock

                  
class StockDetailsSerializer(StockSerializer):
    purchase_entries = serializers.SerializerMethodField(read_only=True)
    total_quantity = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Stock
        fields = StockSerializer.Meta.fields + ['purchase_entries', 'total_quantity']

    def get_total_quantity(self, obj):
        purchase_entries = PurchaseEntries.objects.filter(
            stock=obj,
            remaining_quantity__gt=0
        ).order_by('purchase__date')
        total_quantity = sum(entry.remaining_quantity for entry in purchase_entries)
        return total_quantity
    
    def get_purchase_entries(self, obj):
        purchase_entries = PurchaseEntries.objects.filter(
            stock=obj,
            remaining_quantity__gt=0  
        ).order_by('purchase__date')  

        serializer = PurchaseEntriesSerializer(purchase_entries, many=True)
        return serializer.data