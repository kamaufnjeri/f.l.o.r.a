from journals.models import PurchaseReturnEntries, PurchaseEntries, Account
from rest_framework import serializers
from .journal_entries import JournalEntriesManager
import decimal

journal_entry_manager = JournalEntriesManager()


class PurchaseReturnEntriesManager:
    def create_purchase_return_entries(self, return_entries, purchase_return, purchase):
        cogs = 0.00
        account = None
        for entry in return_entries:
            purchase_entry_id = entry.get('purchase_entry')
            try:
                purchase_entry = PurchaseEntries.objects.get(id=purchase_entry_id, purchase=purchase)
            except PurchaseEntries.DoesNotExist:
                raise serializers.ValidationError(f"Purchase entry with id {purchase_entry_id} not found")
            return_quantity = entry.get('return_quantity')
            if purchase_entry.remaining_quantity > return_quantity and purchase_entry.remaining_quantity > 0:  
                entry['purchase_entry'] = purchase_entry
                stock = purchase_entry.stock
                purchase_entry.remaining_quantity -= return_quantity
                purchase_price = purchase_entry.purchase_price
                return_cogs = purchase_price * return_quantity
                cogs += float(return_cogs)
                PurchaseReturnEntries.objects.create(
                    purchase_return=purchase_return,
                    cogs=return_cogs,
                    purchase_price=purchase_price,
                    **entry
                )
                purchase_entry.save()

            else:
                raise serializers.ValidationError(f"Stock quantity {return_quantity} is greater than available stock {purchase_entry.remaining_quantity}")

        return cogs

    def validate_purchase_return_entries(self, return_entries):
        format = [
            {'purchase_entry': 1, "return_quantity": 2},
            {"purchase_entry": 3,"return_quantity": 4}
        ]

        if not return_entries:
            raise serializers.ValidationError(f"Purchase return entries required in the format: {str(format)}")
        

    def purchase_return_journal_entries(self, purchase_journal_entries, total_purchase_price):
        journal_entries = []
        remaining_amount = total_purchase_price

        for entry in purchase_journal_entries:
            if remaining_amount <= 0:
                break
            account_id = entry.get('account')

            try:
                account = Account.objects.get(id=account_id)
            except Account.DoesNotExist:
                raise serializers.ValidationError(f'Account with ID {account_id} not found')
            if (account.sub_category == "cash_and_cash_equivalents" or account.sub_category == "accounts_payable") and entry.get('debit_credit') == "credit":
                amount_to_use = min(decimal.Decimal(entry.get('amount')), remaining_amount)

                account_data = journal_entry_manager.create_journal_entry(account, amount_to_use, "debit")

                remaining_amount -= amount_to_use

                journal_entries.append(account_data)

        if remaining_amount > 0:
            raise serializers.ValidationError('Total purchase price of returned stocks is more than amount receied')
        
        return journal_entries