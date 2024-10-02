from rest_framework import serializers
from journals.models import SalesPurchasePrice, Stock, PurchaseEntries, SalesEntries


class SalesEntriesManager:
    def cost_of_goods_sold(self, sales_entry, purchase_entries):
        remaining_quantity = sales_entry.sold_quantity
        cogs = 0.00
        
        for entry in purchase_entries:
            quantity_to_use = min(entry.remaining_quantity, remaining_quantity)
            sales_purchase_cogs = entry.purchase_price * quantity_to_use
            cogs += float(sales_purchase_cogs)
            remaining_quantity -= quantity_to_use
            entry.remaining_quantity -= quantity_to_use
            entry.save()

            # Create SalesPurchasePrice entry for each quantity used
            SalesPurchasePrice.objects.create(
                sales_entry=sales_entry,
                purchase_entry=entry,
                purchase_price=entry.purchase_price,
                sales_price=sales_entry.sales_price,
                sold_quantity=quantity_to_use,
                remaining_quantity=quantity_to_use
            )

            if remaining_quantity <= 0:
                break

        if remaining_quantity > 0:
            raise serializers.ValidationError("Insufficient inventory to sell the specified quantity.")
            
        return cogs

    def create_sales_entries(self, sales_entries, sales, StockDetaileSerializer):
        cogs = 0.00
        total_sales_price = 0.00
        for entry in sales_entries:
            stock_id = entry.get('stock')
            if isinstance(stock_id, Stock):
                stock = stock_id
            else:
                try:
                    stock = Stock.objects.get(id=stock_id)
                except Stock.DoesNotExist:
                    raise serializers.ValidationError(f"Stock with id {stock_id} not found")
            
            stock_serializer = StockDetaileSerializer(stock).data
            entry['stock'] = stock

            sold_quantity = entry.get('sold_quantity')
            sales_price = entry.get('sales_price')
            
            if sold_quantity > stock_serializer.get('total_quantity'):
                raise serializers.ValidationError(
                    f"Available stock quantity is {stock_serializer.get('total_quantity')} is less than stock being sold {sold_quantity}"
                )
            
            total_sales_price += float(sales_price * sold_quantity)
            purchase_entries = PurchaseEntries.objects.filter(
                stock=stock,
                remaining_quantity__gt=0
            ).order_by('purchase__date')
        
            sales_entry = SalesEntries.objects.create(
                sales=sales,
                remaining_quantity=sold_quantity,
                **entry
            )
            sales_cogs = self.cost_of_goods_sold(sales_entry, purchase_entries)
            sales_entry.cogs = sales_cogs
            cogs += float(sales_cogs)
            sales_entry.save()

        return cogs, total_sales_price

    def validate_sales_entries(self, sales_entries):
        format = [
            {"stock": 1, "sales_price": 20.00, "sold_quantity": 100},
            {"stock": 2, "sales_price": 40.00, "sold_quantity": 100}
        ]

        if not sales_entries:
            raise serializers.ValidationError(f"Sales entries required in the format: {str(format)}")
        