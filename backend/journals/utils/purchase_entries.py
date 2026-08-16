from journals.models import Stock, PurchaseEntries
from rest_framework import serializers
from django.shortcuts import get_object_or_404
from django.db.models import Sum
from journals.models import PurchaseReturnEntries

class PurchaseEntriesManager:
    def get_stock(self, entry_data):
        stock = entry_data.get('stock')
        if not isinstance(stock, Stock):
        
            try:
                stock = get_object_or_404(Stock, id=stock)
            except Stock.DoesNotExist:
                raise serializers.ValidationError(f"Stock with id {stock} not found")
        return stock
    
    def create_purchase_entry(self, entry, purchase):
        stock = self.get_stock(entry)
        entry['stock'] = stock
        purchase_quantity = entry.get('purchased_quantity')
        purchase_price = entry.get('purchase_price')
        purchase_cogs = purchase_price * purchase_quantity
        purchase_entry = PurchaseEntries.objects.create(
            purchase=purchase,
            cogs=purchase_cogs,
            remaining_quantity=purchase_quantity,
            **entry
        )
        return purchase_cogs, purchase_entry.id
    
    def update_purchase_entry(self, entry, purchase):
        stock = self.get_stock(entry)

        purchase_entry = PurchaseEntries.objects.get(
            purchase=purchase,
            id=entry.get('id')
        )

        purchase_quantity = entry.get('purchased_quantity')
        purchase_price = entry.get('purchase_price')

        # Get actual purchase returns from the database
        returned_quantity = (
            PurchaseReturnEntries.objects
            .filter(purchase_entry=purchase_entry)
            .aggregate(total=Sum('return_quantity'))
            ['total'] or 0
        )

        if returned_quantity > purchase_quantity:
            raise serializers.ValidationError(
                f"Purchased quantity ({purchase_quantity}) "
                f"cannot be less than returned quantity ({returned_quantity})."
            )

        remaining_quantity = purchase_quantity - returned_quantity

        purchase_cogs = purchase_price * purchase_quantity

        purchase_entry.stock = stock
        purchase_entry.remaining_quantity = remaining_quantity
        purchase_entry.purchased_quantity = purchase_quantity
        purchase_entry.purchase_price = purchase_price
        purchase_entry.cogs = purchase_cogs

        purchase_entry.save()

        return purchase_cogs, purchase_entry.id

    def create_purchase_entries(self, purchase_entries_data, purchase):
        cogs = 0.00
        for entry in purchase_entries_data:
            purchase_cogs, _ = self.create_purchase_entry(entry, purchase)
            
            cogs += float(purchase_cogs)
            
        return cogs

    def validate_purchase_entries(self, purchase_entries):
        format = [
            {"stock": 1, "purchase_price": 20.00, "purchase_quantity": 100},
            {"stock": 2, "purchase_price": 40.00, "purchase_quantity": 100}
        ]

        if not purchase_entries:
            raise serializers.ValidationError(f"Purchase entries required in the format: {str(format)}")
        
   
        
    def update_purchase_entries(self, purchase_entries, purchase):
        cogs = 0.00
        entries_id = []
        for entry_data in purchase_entries:
            if entry_data.get('id'):
                purchase_cogs, entry_id = self.update_purchase_entry(entry=entry_data, purchase=purchase)
                cogs += float(purchase_cogs)
                entries_id.append(entry_id)
            else:
                purchase_cogs, entry_id = self.create_purchase_entry(entry=entry_data, purchase=purchase)
                cogs += float(purchase_cogs)
                entries_id.append(entry_id)
        return cogs, entries_id
        
    