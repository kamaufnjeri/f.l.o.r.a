from rest_framework import serializers
from journals.models import SalesEntries, SalesReturnEntries, SalesPurchasePrice, Account
from .journal_entries import JournalEntriesManager
import decimal

journal_entry_manager = JournalEntriesManager()


class SalesReturnEntriesManager:
    def validate_sales_return_entries(self, return_entries):
        format = [
            {'sales_entry': 1, "return_quantity": 2},
            {"sales_entry": 3,"return_quantity": 4}
        ]

        if not return_entries:
            raise serializers.ValidationError(f"Sales return entries required in the format: {str(format)}")
        
    def create_sales_return_entries(self, return_entries, sales_return, sales):
        cogs = 0.00
        total_sales_price = 0.00
        account = None
        for entry in return_entries:
            sales_entry_id= entry.get('sales_entry')
            try:
                sales_entry = SalesEntries.objects.get(id=sales_entry_id, sales=sales)
            except SalesEntries.DoesNotExist:
                raise serializers.ValidationError(f"Sales entry with id {sales_entry_id} not found")
            
            entry['sales_entry'] = sales_entry

            return_quantity = entry.get('return_quantity')
            sales_price = sales_entry.sales_price
            
            if return_quantity > sales_entry.sold_quantity:
                raise serializers.ValidationError(
                    f"Sales return quantity {return_quantity} is more than the amount sold {sales_entry.sold_quantity}"
                )
            
            total_sales_price += float(sales_price * return_quantity)
            sales_purchase_price_entries = SalesPurchasePrice.objects.filter(
                sales_entry=sales_entry
            ).order_by('-purchase_entry__purchase__date')
            price = sales_entry.sales_price

            sales_returns_cogs, _ = self.reverse_fifo(sales_purchase_price_entries, return_quantity)
            SalesReturnEntries.objects.create(
                sales_return=sales_return,
                sales_price=price,
                cogs=sales_returns_cogs,
                **entry
            )
            sales_entry.sold_quantity -= return_quantity
            sales_entry.save()
            cogs += float(sales_returns_cogs)

        return cogs, total_sales_price

    def reverse_fifo(self, sales_purchase_price_entries, return_quantity):
        cogs = 0.00
        sales_price = 0.00
        remaining_quantity = return_quantity

        for entry in sales_purchase_price_entries:
            if remaining_quantity <= 0:
                break

            quantity_to_use = min(entry.sold_quantity, remaining_quantity)
            sales_purchase_cogs = entry.purchase_price * quantity_to_use
            sales_price += float(entry.sales_price * quantity_to_use)
            cogs += float(sales_purchase_cogs)
            remaining_quantity -= quantity_to_use

            # Update purchase entry
            purchase_entry = entry.purchase_entry
            purchase_entry.remaining_quantity += quantity_to_use
            purchase_entry.save()

            # Update sales purchase price entry
            entry.sold_quantity -= quantity_to_use
            entry.save()

        if remaining_quantity > 0:
            raise serializers.ValidationError("Insufficient inventory to process the return quantity.")

        return cogs, sales_price
    
    def sales_return_journal_entries(self, sales_journal_entries, total_sales_price):
        journal_entries = []
        remaining_amount = total_sales_price

        for entry in sales_journal_entries:
            print(entry)
            if remaining_amount <= 0:
                break
            account_id = entry.get('account')

            try:
                account = Account.objects.get(id=account_id)
            except Account.DoesNotExist:
                raise serializers.ValidationError(f'Account with ID {account_id} not found')
            if (account.sub_category == "cash_and_cash_equivalents" or account.sub_category == "accounts_receivable") and entry.get('debit_credit') == "debit":
                amount_to_use = min(decimal.Decimal(entry.get('amount')), remaining_amount)

                account_data = journal_entry_manager.create_journal_entry(account, amount_to_use, "credit")

                remaining_amount -= amount_to_use

                journal_entries.append(account_data)

        if remaining_amount > 0:
            raise serializers.ValidationError('Total sales price of returned stocks is more than amount receied')
        
        return journal_entries