from rest_framework import serializers
from django.db import transaction
from journals.models import Stock, PurchaseEntries, SalesEntries, FloraUser, Organisation, PurchaseReturnEntries, SalesReturnEntries
from datetime import date
from journals.utils import StockUtils


class StockSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    opening_stock_rate = serializers.DecimalField(max_digits=15, decimal_places=2, required=False, write_only=True)
    opening_stock_quantity = serializers.IntegerField(required=False, write_only=True)
    total_quantity = serializers.SerializerMethodField(read_only=True)
    user = serializers.PrimaryKeyRelatedField(queryset=FloraUser.objects.all())
    organisation = serializers.PrimaryKeyRelatedField(queryset=Organisation.objects.all())


    class Meta:
        model = Stock
        fields = [
            'id', 'name', 'unit_name', 'user', 'organisation',
            'unit_alias', 'opening_stock_quantity', 
            'opening_stock_rate', 'total_quantity'
        ]

    
    def get_total_quantity(self, obj):
        purchase_entries = PurchaseEntries.objects.filter(
            stock=obj,
            remaining_quantity__gt=0
        ).order_by('purchase__date')
        sales_entries = SalesEntries.objects.filter(
            stock=obj,
            remaining_quantity__gt=0
        )
        total_quantity = sum(entry.remaining_quantity for entry in purchase_entries) - sum(entry.remaining_quantity for entry in sales_entries)

        return total_quantity
    
    def validate(self, data):
        opening_stock_quantity = data.get('opening_stock_quantity')
        opening_stock_rate = data.get('opening_stock_rate')
        organisation_id = data.get('organisation')

        
        if 'name' in data:
            new_name = data['name']
            
            try:
                stock = Stock.objects.get(name=new_name, organisation_id=organisation_id)
                raise serializers.ValidationError(f"Stock with name {new_name} already exists in this organisation.")
            except Stock.DoesNotExist:
                pass  

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
            
class StockDetailsSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    stock_summary = serializers.SerializerMethodField(read_only=True)
   
    
    class Meta:
        model = Stock
        fields = ['name', 'unit_alias', 'unit_name', 'stock_summary', 'id', 'organisation']

    def validate(self, data):
        organisation_id = data.pop('organisation')
        if 'name' in data:
            new_name = data['name']
            stock_id = self.instance.id  
            
            try:
                stock = Stock.objects.exclude(id=stock_id).get(name=new_name, organisation_id=organisation_id)
                raise serializers.ValidationError(f"Stock with name {new_name} already exists in this organisation.")
            except Stock.DoesNotExist:
                pass  
        if self.partial:
            allowed_fields = {'name', 'unit_name', 'unit_alias'}
            for field in data.keys():
                if field not in allowed_fields:
                    raise serializers.ValidationError(f"{field} is not allowed in a partial update.")
        return data

   
    
    def get_stock_summary(self, obj):
        date_param = self.context.get('date', None)

        stock_entries = StockUtils(obj, period=date_param).get_entries()
        
        
        return stock_entries

    

