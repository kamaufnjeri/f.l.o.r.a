from rest_framework import serializers
from journals.models import SalesEntries, SalesReturnEntries, Account
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
        
    def create_sales_return_entries(self, return_entries, sales_return, sales, discount_percentage):
        total_return_price = 0.00
        for entry in return_entries:
            sales_entry_id= entry.get('sales_entry')
            try:
                sales_entry = SalesEntries.objects.get(id=sales_entry_id, sales=sales)
            except SalesEntries.DoesNotExist:
                raise serializers.ValidationError(f"Sales entry with id {sales_entry_id} not found")
            
            entry['sales_entry'] = sales_entry
            stock = sales_entry.stock

            return_quantity = entry.get('return_quantity')
            return_price = sales_entry.sales_price
            if discount_percentage != None:
                return_price = return_price * (1 - (decimal.Decimal(discount_percentage) / 100))
            
            if return_quantity > sales_entry.remaining_quantity:
                raise serializers.ValidationError(
                    f"Sales return quantity {return_quantity} is more than the amount sold {sales_entry.sold_quantity}"
                )
            
            total_return_price += float(return_price * return_quantity)
           
            sales_price = sales_entry.sales_price

            SalesReturnEntries.objects.create(
                sales_return=sales_return,
                stock=stock,
                sales_price=sales_price,
                return_price=return_price,
                **entry
            )
            sales_entry.remaining_quantity -= return_quantity
            sales_entry.save()

        return total_return_price

   
    def sales_return_journal_entries(self, sales_journal_entries, total_return_price):
        journal_entries = []
        remaining_amount = total_return_price

        for entry in sales_journal_entries:
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
            raise serializers.ValidationError('Total sales price of returned stocks is more than amount received')
        
        return journal_entries