from journals.models import Stock, PurchaseEntries
from rest_framework import serializers


class PurchaseEntriesManager:
    def create_purchase_entries(self, purchase_entries_data, purchase):
        cogs = 0.00
        for entry in purchase_entries_data:
            stock_id = entry.get('stock')
            if isinstance(stock_id, Stock):
                stock = stock_id
            else:
                try:
                    stock = Stock.objects.get(id=stock_id)
                except Stock.DoesNotExist:
                    raise serializers.ValidationError(f"Stock with id {stock_id} not found")
                    
            entry['stock'] = stock
            purchase_quantity = entry.get('purchased_quantity')
            purchase_price = entry.get('purchase_price')
            purchase_cogs = purchase_price * purchase_quantity
            cogs += float(purchase_cogs)
            PurchaseEntries.objects.create(
                purchase=purchase,
                cogs=purchase_cogs,
                remaining_quantity=purchase_quantity,
                **entry
            )

        return cogs

    def validate_purchase_entries(self, purchase_entries):
        format = [
            {"stock": 1, "purchase_price": 20.00, "purchase_quantity": 100},
            {"stock": 2, "purchase_price": 40.00, "purchase_quantity": 100}
        ]

        if not purchase_entries:
            raise serializers.ValidationError(f"Purchase entries required in the format: {str(format)}")
        
    