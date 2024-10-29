from rest_framework import serializers
from journals.models import Stock, SalesEntries


class SalesEntriesManager:
    def create_sales_entries(self, sales_entries, sales, StockDetaileSerializer):
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
            
            SalesEntries.objects.create(
                sales=sales,
                remaining_quantity=sold_quantity,
                **entry
            )

        return total_sales_price

    def validate_sales_entries(self, sales_entries):
        format = [
            {"stock": 1, "sales_price": 20.00, "sold_quantity": 100},
            {"stock": 2, "sales_price": 40.00, "sold_quantity": 100}
        ]

        if not sales_entries:
            raise serializers.ValidationError(f"Sales entries required in the format: {str(format)}")
        