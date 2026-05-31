from datetime import datetime, timedelta
from django.db.models import Q
from journals.models import PurchaseEntries, SalesEntries, PurchaseReturnEntries, SalesReturnEntries

class StockUtils:
    def __init__(self, stock, period=None):
        self.stock = stock
        self.period = period

    def get_opening_balance(self):
       
        start_date = self.get_start_date()

        opening_stocks_entries = PurchaseEntries.objects.filter(purchase__isnull=True, stock=self.stock)
        from journals.serializers import DetailedPurchaseEntriesSerializer
        
        entries_serializer_data = DetailedPurchaseEntriesSerializer(opening_stocks_entries, many=True).data
        purchases_before, _ = self.get_purchase_entries(before_date=start_date)
        
        purchases_before.extend(entries_serializer_data)
        sales_before, _ = self.get_sales_entries(before_date=start_date)
        purchase_returns_before, _ = self.get_purchase_returns_entries(before_date=start_date)
        sales_returns_before, _ = self.get_sales_return_entries(before_date=start_date)
        purchases_before_quantity, purchases_return_before_quantity, average_cost = self.get_average_cost(purchases_before, purchase_returns_before)
        opening_stock = purchases_before_quantity \
                            - sum(entry.get('details').get('quantity') for entry in sales_before) \
                            + sum(entry.get('details').get('quantity') for entry in sales_returns_before) \
                            - purchases_return_before_quantity

        if average_cost > 0 and opening_stock > 0:
        
            opening_stock_total = float(opening_stock) * float(average_cost)
            opening_entries = {
                'details': {
                    'date': start_date,
                    'type': 'Opening Stock',
                    'quantity': opening_stock,
                    'rate': round(average_cost, 2),
                    'total': round(opening_stock_total, 2),
                    'description': 'Opening stock before the start of the period'
                }
            }
            opening_stock_data = {
                'name': 'Opening Stock',
                'quantity': opening_stock,
                'amount': round(opening_stock_total, 2),
            }
            return opening_entries, opening_stock_data
        return None, None

    def get_average_cost(self, purchases, purchase_returns):
      
        total_cost = (
            sum(
                float(entry['details']['quantity']) * float(entry['details']['rate']) 
                for entry in purchases
            )
            - sum(
                float(entry['details']['quantity']) * float(entry['details']['rate'])  
                for entry in purchase_returns
            )
        )

        total_purchases = sum(entry['details']['quantity'] for entry in purchases)
        total_purchase_returns = sum(entry['details']['quantity'] for entry in purchase_returns)

        average_cost = 0
        if (total_purchases - total_purchase_returns) > 0:
            average_cost = total_cost / (total_purchases - total_purchase_returns)
        else:
            average_cost = 0

        return total_purchases, total_purchase_returns, average_cost

         


    def get_closing_balance(self):
       
        start_date = self.get_start_date()
        end_date = self.get_end_date() + timedelta(days=1)
        
        purchases, _ = self.get_purchase_entries(after_date=start_date, before_date=end_date)
        sales, _ = self.get_sales_entries(after_date=start_date, before_date=end_date)
        purchase_returns, _ = self.get_purchase_returns_entries(after_date=start_date, before_date=end_date)
        sales_returns, _ = self.get_sales_return_entries(after_date=start_date, before_date=end_date)


        opening_entries, opening_stock_data = self.get_opening_balance()

        if opening_entries:
            purchases.append(opening_entries)

        purchases_total, purchase_returns_total, average_cost = self.get_average_cost(purchases, purchase_returns)


        closing_stock = purchases_total \
                        - sum(entry.get('details').get('quantity') for entry in sales) \
                        + sum(entry.get('details').get('quantity') for entry in sales_returns) \
                        - purchase_returns_total
        
        
        closing_stock_total = closing_stock * average_cost


        closing_entries = {
            'details': {
                'type': 'Closing Stock',
                'date': self.get_end_date(),
                'quantity': closing_stock,
                'rate': round(average_cost, 2),
                'total': round(closing_stock_total, 2),
                'description': 'Closing stock at the end of the period'
            }
        }
        closing_stock_data = {
            'name': 'Closing Stock',
            'quantity': closing_stock,
            'amount': round(closing_stock_total, 2),
        }

        return opening_entries, closing_entries, opening_stock_data, closing_stock_data

    def get_entries(self):
        
        sorted_stock_entries = self.get_sorted_stock_entries()
        return sorted_stock_entries

    def get_start_date(self):
        
        today = datetime.today().date()
        if self.period:
            if self.period == 'today':
                return today
            elif self.period == 'yesterday':
                return today - timedelta(days=1)
            elif self.period == 'this_week':
                return today - timedelta(days=today.weekday())
            elif self.period == 'this_month':
                return today.replace(day=1)
            elif isinstance(self.period, str) and 'to' in self.period:

                start_date_str = self.period.split('to')[0]
                return datetime.strptime(start_date_str, "%Y-%m-%d").date()
            else:
                return self.stock.created_at.date()
        else:
            return self.stock.created_at.date()

    def get_end_date(self):
       
        today = datetime.today().date()
        if self.period:
            if self.period == 'today':
                return today
            elif self.period == 'yesterday':
                return today - timedelta(days=1)
            elif self.period == 'this_week':
                return today
            elif self.period == 'this_month':
                return today
            elif 'to' in self.period:
                end_date_str = self.period.split('to')[1]
                return datetime.strptime(end_date_str, "%Y-%m-%d").date()
                
            else:
                return today
        else:
            return today

    def get_stock_entries(self):
       
        start_date = self.get_start_date()
        end_date = self.get_end_date() + timedelta(days=1)

        purchases, purchase_totals = self.get_purchase_entries(after_date=start_date, before_date=end_date)
        sales, sales_totals = self.get_sales_entries(after_date=start_date, before_date=end_date)
        purchase_returns, purchase_returns_totals = self.get_purchase_returns_entries(after_date=start_date, before_date=end_date)
        sales_returns, sales_returns_totals = self.get_sales_return_entries(after_date=start_date, before_date=end_date)

        entries_list = list(purchases) + list(sales) + list(purchase_returns) + list(sales_returns)
        
        totals_list = [purchase_totals, sales_totals, purchase_returns_totals, sales_returns_totals]

        return entries_list, totals_list

    def get_purchase_entries(self, before_date=None, after_date=None):
        purchase_entries = self.stock.purchase_entries.all()

        if before_date:
            purchase_entries = purchase_entries.filter(purchase__date__lt=before_date)
        if after_date:
            purchase_entries = purchase_entries.filter(purchase__date__gte=after_date)

        from journals.serializers import DetailedPurchaseEntriesSerializer

        entries_serializer_data = DetailedPurchaseEntriesSerializer(purchase_entries, many=True).data

        total_quantity = sum(float(entry.get('details').get('quantity', 0)) for entry in entries_serializer_data)
        total_amount = sum(float(entry.get('details').get('total', 0)) for entry in entries_serializer_data)
       
        purchase_totals = {
            'name': 'Purchases',
            'quantity': total_quantity,
            'amount': total_amount
        }

        return entries_serializer_data, purchase_totals

    def get_sales_entries(self, before_date=None, after_date=None):
        sales_entries = SalesEntries.objects.filter(stock=self.stock)

        if before_date:
            sales_entries = sales_entries.filter(sales__date__lt=before_date)
        if after_date:
            sales_entries = sales_entries.filter(sales__date__gte=after_date)

        from journals.serializers import DetailedSalesEntriesSerializer

        entries_serializer_data = DetailedSalesEntriesSerializer(sales_entries, many=True).data

        total_quantity = sum(float(entry.get('details').get('quantity', 0)) for entry in entries_serializer_data)
        total_amount = sum(float(entry.get('details').get('total', 0)) for entry in entries_serializer_data)

        sales_totals = {
            'name': 'Sales',
            'quantity': total_quantity,
            'amount': total_amount
        }

        return entries_serializer_data, sales_totals

    def get_purchase_returns_entries(self, before_date=None, after_date=None):
        purchase_return_entries = PurchaseReturnEntries.objects.filter(stock=self.stock)

        if before_date:
            purchase_return_entries = purchase_return_entries.filter(purchase_return__date__lt=before_date)
        if after_date:
            purchase_return_entries = purchase_return_entries.filter(purchase_return__date__gte=after_date)

        from journals.serializers import DetailedPurchaseReturnEntriesSerializer

        entries_serializer_data = DetailedPurchaseReturnEntriesSerializer(purchase_return_entries, many=True).data

        total_quantity = sum(float(entry.get('details').get('quantity', 0)) for entry in entries_serializer_data)
        total_amount = sum(float(entry.get('details').get('total', 0)) for entry in entries_serializer_data)

        purchase_returns_totals = {
            'name': 'Purchase Returns',
            'quantity': total_quantity,
            'amount': total_amount
        }

        return entries_serializer_data, purchase_returns_totals

    def get_sales_return_entries(self, before_date=None, after_date=None):
        sales_return_entries = SalesReturnEntries.objects.filter(stock=self.stock)

        if before_date:
            sales_return_entries = sales_return_entries.filter(sales_return__date__lt=before_date)
        if after_date:
            sales_return_entries = sales_return_entries.filter(sales_return__date__gte=after_date)

        from journals.serializers import DetailedSalesReturnEntriesSerializer

        entries_serializer_data = DetailedSalesReturnEntriesSerializer(sales_return_entries, many=True).data

        total_quantity = sum(float(entry.get('details').get('quantity', 0)) for entry in entries_serializer_data)
        total_amount = sum(float(entry.get('details').get('total', 0)) for entry in entries_serializer_data)

        sales_returns_totals = {
            'name': 'Sales Returns',
            'quantity': total_quantity,
            'amount': total_amount
        }

        return entries_serializer_data, sales_returns_totals

    def get_sorted_stock_entries(self):
        stock_entries, total_lists = self.get_stock_entries()
        opening_entries, closing_entries, opening_totals, closing_totals = self.get_closing_balance()

        sorted_stock_entries = sorted(stock_entries, key=lambda x: x.get('details').get('date'))

        if opening_entries and opening_totals:
            total_lists.append(opening_totals)
            sorted_stock_entries.insert(0, opening_entries)

        if closing_entries and closing_totals:
            total_lists.append(closing_totals)
            sorted_stock_entries.append(closing_entries)

        return {
            'entries': sorted_stock_entries,
            "totals": total_lists
        }
