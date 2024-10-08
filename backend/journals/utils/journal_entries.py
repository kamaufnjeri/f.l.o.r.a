from rest_framework import serializers
from journals.models import Account, JournalEntries
import decimal

class JournalEntriesManager:
    def create_journal_entries(self, journal_entries_data, type: str, table, AccountDetailsSerializer):
        for entry_data in journal_entries_data:
            account = entry_data.get('account')
           
            if isinstance(account, Account):
                account = account
            else:
                account_id = account
                try:
                    account = Account.objects.get(id=account_id)
                except Account.DoesNotExist:
                    raise serializers.ValidationError(f"Account with id {account_id} not found")
            account_serializer = AccountDetailsSerializer(account).data
            current_balance = account_serializer.get('account_balance')
            group = account_serializer.get('group')

            if (
                (
                    group in ("asset", "expense") and entry_data.get('debit_credit') == "credit"
                ) or (
                        group in ("liability", "capital", "income") and entry_data.get('debit_credit') == "debit"
                    )
            ) and current_balance < entry_data.get('amount'):
                raise serializers.ValidationError(
                    f'Account {account_serializer.get("name")} has insufficient balance'
                )
        
                
            entry_data['account'] = account

            if type == "journal":
                JournalEntries.objects.create(journal=table, **entry_data)
            elif type == "purchase":
                JournalEntries.objects.create(purchase=table, **entry_data)

            elif type == "purchase_return":
                JournalEntries.objects.create(purchase_return=table, **entry_data)

            elif type == "sales":
                JournalEntries.objects.create(sales=table, **entry_data)

            elif type == "sales_return":
                JournalEntries.objects.create(sales_return=table, **entry_data)
            elif type == "payments":
                JournalEntries.objects.create(payments=table, **entry_data)

    def validate_journal_entries(self, journal_entries):
        format = [
            {"account": 1, "amount": 2000.00, "debit_credit": "debit"},
            {"account": 2, "amount": 2000.00, "debit_credit": "credit"}
        ]
        if not journal_entries:
            raise serializers.ValidationError(f"Journal entries required in the format: {str(format)}")
        
    def validate_double_entry(self, journal_entries):
        debit_total = sum(entry.get('amount') for entry in journal_entries  if entry.get('debit_credit') == 'debit')
        credit_total = sum(entry.get('amount') for entry in journal_entries  if entry.get('debit_credit') == 'credit')
        

        if debit_total != credit_total:
            raise serializers.ValidationError("For every journal entered the debit and credit amounts need to be equal")
        
    def sales_journal_entries_dict(self, journal_entries, cogs, total_sales_price, discount=None):
        inventory_account = Account.objects.get(name="Inventory")
        cogs_account = Account.objects.get(name="Cost of goods sold")
        sales_revenue_account = Account.objects.get(name="Sales Revenue")
        inventory_account_data = self.create_journal_entry(inventory_account, decimal.Decimal(cogs), "credit")
        sales_revenue_data = self.create_journal_entry(sales_revenue_account, decimal.Decimal(total_sales_price),"credit")

        if discount:
            discount_account = Account.objects.get(name='Discount allowed')

            discount_account_data = self.create_journal_entry(discount_account, decimal.Decimal(discount), 'debit')
            journal_entries.append(discount_account_data)

        cogs_data = self.create_journal_entry(cogs_account, decimal.Decimal(cogs), "debit")
        journal_entries.append(inventory_account_data)
        journal_entries.append(sales_revenue_data)
        journal_entries.append(cogs_data)

        return journal_entries
    
    def create_journal_entry(self, account, amount, type):
        return {
            "account": account.id,
            "amount": amount,
            "debit_credit": type
        }