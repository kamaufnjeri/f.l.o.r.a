from rest_framework import serializers
from journals.models import Stock, SalesEntries
from django.db import transaction

from django.db.models import Sum

class SalesEntriesManager:
    def get_stock(self, entry_data):
        stock = entry_data.get('stock')
        if not isinstance(stock, Stock):
        
            try:
                stock = Stock.objects.get(id=stock)
            except Stock.DoesNotExist:
                raise serializers.ValidationError(f"Stock with id {stock} not found")
        return stock

    @transaction.atomic
    def create_sale_entry(self, entry, sales):
        stock = self.get_stock(entry_data=entry) 

        from journals.serializers import StockSerializer
        stock_serializer = StockSerializer(stock).data
        entry['stock'] = stock
        sold_quantity = entry.get('sold_quantity')
        sales_price = entry.get('sales_price')
            
        if sold_quantity > stock_serializer.get('total_quantity'):
            raise serializers.ValidationError(
                f"Available stock quantity is {stock_serializer.get('total_quantity')} is less than stock being sold {sold_quantity}"
            )
        
        total_sales_price = float(sales_price) * float(sold_quantity)
            
        sales_entry =  SalesEntries.objects.create(
                sales=sales,
                remaining_quantity=sold_quantity,
                **entry
            )
        return total_sales_price, sales_entry.id
    
    @transaction.atomic
    def update_sale_entry(self, entry, sales):
        stock = self.get_stock(entry)

        sales_entry = SalesEntries.objects.get(
            sales=sales,
            id=entry.get('id')
        )

        sold_quantity = entry.get('sold_quantity')
        sales_price = entry.get('sales_price')

        if sold_quantity <= 0:
            raise serializers.ValidationError(
                "Sold quantity must be greater than zero."
            )

        # --------------------------------------------------
        # Get the ACTUAL quantity already returned
        # from SalesReturnEntries
        # --------------------------------------------------

        returned_quantity = (
            SalesReturnEntries.objects
            .filter(sales_entry=sales_entry)
            .aggregate(
                total=Sum('return_quantity')
            )['total'] or 0
        )

        # --------------------------------------------------
        # The new sold quantity cannot be less than
        # the quantity already returned
        # --------------------------------------------------

        if sold_quantity < returned_quantity:
            raise serializers.ValidationError(
                f"Updated quantity {sold_quantity} cannot be "
                f"less than already returned quantity "
                f"{returned_quantity}."
            )

        # --------------------------------------------------
        # Remaining = new sold quantity - actual returns
        # --------------------------------------------------

        remaining_quantity = (
            sold_quantity - returned_quantity
        )

        # --------------------------------------------------
        # Update
        # --------------------------------------------------

        entry['stock'] = stock

        total_sales_price = (
            float(sales_price) * float(sold_quantity)
        )

        sales_entry.sold_quantity = sold_quantity
        sales_entry.sales_price = sales_price
        sales_entry.remaining_quantity = remaining_quantity
        sales_entry.stock = stock

        sales_entry.save()

        return total_sales_price, sales_entry.id
        
    def create_sales_entries(self, sales_entries, sales):
        total_sales_price = 0.00
        for entry in sales_entries:
            sales_price, _ = self.create_sale_entry(entry, sales)
            
            total_sales_price += float(sales_price)
           
        return total_sales_price

    def validate_sales_entries(self, sales_entries):
        format = [
            {"stock": 1, "sales_price": 20.00, "sold_quantity": 100},
            {"stock": 2, "sales_price": 40.00, "sold_quantity": 100}
        ]

        if not sales_entries:
            raise serializers.ValidationError(f"Sales entries required in the format: {str(format)}")
        
    def update_sales_entries(self, sales_entries, sales):
        total_sales_price = 0.00
        entries_id = []
        for entry_data in sales_entries:
            if entry_data.get('id'):
                sales_price, entry_id = self.update_sale_entry(entry=entry_data, sales=sales)
                total_sales_price += float(sales_price)
                entries_id.append(entry_id)
            else:
                sales_price, entry_id = self.create_sale_entry(entry=entry_data, sales=sales)
                total_sales_price += float(sales_price)
                entries_id.append(entry_id)
        return total_sales_price, entries_id
        