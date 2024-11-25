from rest_framework import serializers
from journals.models import Account, JournalEntries
import decimal

class JournalEntriesManager:
    def get_account(self, entry_data, update):
        account = entry_data.get('account')

           
        if isinstance(account, Account):
            account = account
        else:
            account_id = account
            try:
                account = Account.objects.get(id=account_id)
            except Account.DoesNotExist:
                raise serializers.ValidationError(f"Account with id {account_id} not found")
        from journals.serializers import AccountSerializer
        account_serializer = AccountSerializer(account).data
        current_balance = account_serializer.get('account_balance')
        group = account_serializer.get('group')
        sub_category = account_serializer.get('sub_category')
        name = account_serializer.get("name")
        entry_amount = entry_data.get('amount')
        entry_type = entry_data.get('debit_credit')

        if not update:
            formatted_sub_category = sub_category.lower().replace(' ', '_')
            formatted_group = group.lower().replace(' ', '_')
            if (
                (formatted_group in ("asset", "expense") and entry_type == "credit") or
                (formatted_group in ("liability", "capital", "income") and entry_type == "debit")
            ):
                if current_balance - entry_amount < 0:
                    if formatted_sub_category not in ("contra-revenue", "contra-expense"):
                        raise serializers.ValidationError(
                            f'Account {name} has insufficient balance for the {entry_type} entry'
                        )
            
        return account

    def add_journal_entry(self, entry_data, type, table, update):
        print('up', update)
        account = self.get_account(entry_data, update)
                
        
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
        elif type == "service_income":
            JournalEntries.objects.create(service_income=table, **entry_data)
        else:
            raise serializers.ValidationError("Invalid choice: Valid choices are 'journal', 'purchase', 'sales', 'purchase_return', 'payments', 'service_income' or 'sales_return'")
        
    def create_journal_entries(self, journal_entries_data, type: str, table, AccountDetailsSerializer=None):
        for entry_data in journal_entries_data:
            self.add_journal_entry(entry_data, type, table, update=False)

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
        
    def sales_journal_entries_dict(self, journal_entries, total_sales_price, organisation_id):
        try:
            sales_account = Account.objects.get(name="Sales", organisation_id=organisation_id)
        except Account.DoesNotExist:
            raise serializers.ValidationError("Sales accounts not found")
        sales_account_data = self.create_journal_entry(sales_account, decimal.Decimal(total_sales_price), "credit")
        journal_entries.append(sales_account_data)

        return journal_entries
    
    def create_journal_entry(self, account, amount, type):
        return {
            "account": account.id,
            "amount": amount,
            "debit_credit": type
        }
    
    def validate_update_journal_entries(self, journal_entries):
        format = [
            {"account": 1, "amount": 2000.00, "debit_credit": "debit", "delete": False},
            {"account": 2, "amount": 2000.00, "debit_credit": "credit", "delete": False}
        ]
        if not journal_entries:
            raise serializers.ValidationError(f"Journal entries required in the format: {str(format)}")
        
    def update_journal_entries(self, journal_entries_data, type: str, table):
        for entry_data in journal_entries_data:
            self.add_journal_entry(entry_data, type, table, update=True)