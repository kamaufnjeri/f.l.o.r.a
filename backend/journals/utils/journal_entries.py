from rest_framework import serializers
from journals.models import Account, JournalEntries
import decimal

class JournalEntriesManager:
    def get_account(self, entry_data):
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

        
        formatted_sub_category = sub_category.lower().replace(' ', '_')
        formatted_group = group.lower().replace(' ', '_')
        if (
            (formatted_group in ("asset", "expense") and entry_type == "credit") or
            (formatted_group in ("liability", "capital", "income") and entry_type == "debit")
        ):
            if float(current_balance) - float(entry_amount) < 0:
                if formatted_sub_category not in ("contra-revenue", "contra-expense"):
                    raise serializers.ValidationError(
                        f'Account {name} has insufficient balance for the {entry_type} entry'
                    )
            
        return account

    def add_journal_entry(self, entry_data, type, table, total_amount, due_date=None):
        account = self.get_account(entry_data)

        entry_data['account'] = account
        entry = None

        if type == "journal":
            entry = JournalEntries.objects.create(journal=table, **entry_data)
        elif type == "purchase":
            if entry_data.get('type') == 'bill' and due_date:
                supplier = account.supplier
                amount_due = entry_data.get('amount')
                from journals.models import Bill
                Bill.objects.create(purchase=table, supplier=supplier, amount_due=amount_due, total_amount=amount_due, amount_paid=0, status="unpaid", due_date=due_date)
            elif (entry_data.get('type') == 'bill' and not due_date):
                raise serializers.ValidationError(f"Due date is required for bill")
                
            if entry_data.get('type') == 'purchase' and entry_data.get('amount') != total_amount:
                raise serializers.ValidationError(f"Purchase entries amount {total_amount} not equal to purchase account amount {entry_data.get('amount')}")
            entry = JournalEntries.objects.create(purchase=table, **entry_data)

        elif type == "purchase_return":
            entry = JournalEntries.objects.create(purchase_return=table, **entry_data)

        elif type == "sales":
            if entry_data.get('type') == 'invoice' and due_date:
                customer = account.customer
                amount_due = entry_data.get('amount')
                from journals.models import Invoice
                Invoice.objects.create(sales=table, customer=customer, amount_due=amount_due, total_amount=amount_due, amount_paid=0, status="unpaid", due_date=due_date)
            elif (entry_data.get('type') == 'invoice' and not due_date):
                raise serializers.ValidationError(f"Due date is required for invoice")
            if entry_data.get('type') == 'sales' and entry_data.get('amount') != total_amount:
                raise serializers.ValidationError(f"Sales entries amount {total_amount} not equal to sales account amount {entry_data.get('amount')}")
            entry = JournalEntries.objects.create(sales=table, **entry_data)

        elif type == "sales_return":
            entry = JournalEntries.objects.create(sales_return=table, **entry_data)
        elif type == "payments":
            entry = JournalEntries.objects.create(payments=table, **entry_data)
        elif type == "service_income":
            if entry_data.get('type') == 'invoice' and due_date:
                customer = account.customer
                amount_due = entry_data.get('amount')
                from journals.models import Invoice
                Invoice.objects.create(service_income=table, customer=customer, amount_due=amount_due, total_amount=amount_due, amount_paid=0, status="unpaid", due_date=due_date)
            elif (entry_data.get('type') == 'invoice' and not due_date):
                raise serializers.ValidationError(f"Due date is required for invoice")
            if entry_data.get('type') == 'service_income' and entry_data.get('amount') != total_amount:
                raise serializers.ValidationError(f"Service income entries amount {total_amount} not equal to service income account amount {entry_data.get('amount')}")
            entry = JournalEntries.objects.create(service_income=table, **entry_data)
        else:
            raise serializers.ValidationError("Invalid choice: Valid choices are 'journal', 'purchase', 'sales', 'purchase_return', 'payments', 'service_income' or 'sales_return'")
        return entry.id
        
    def create_journal_entries(self, journal_entries_data, type: str, table, due_date=None, total_amount=0):
        for entry_data in journal_entries_data:
            self.add_journal_entry(entry_data=entry_data, type=type, table=table, due_date=due_date, total_amount=total_amount)

    def validate_journal_entries(self, journal_entries):
        format = [
            {"account": 1, "amount": 2000.00, "debit_credit": "debit"},
            {"account": 2, "amount": 2000.00, "debit_credit": "credit"}
        ]
        if not journal_entries:
            raise serializers.ValidationError(f"Journal entries required in the format: {str(format)}")
        
    def validate_double_entry(self, journal_entries):
        debit_total = sum(float(entry.get('amount')) for entry in journal_entries  if entry.get('debit_credit') == 'debit')
        credit_total = sum(float(entry.get('amount')) for entry in journal_entries  if entry.get('debit_credit') == 'credit')

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
    
    def create_journal_entry(self, account, amount, debit_credit, type=None):
        return {
            "account": account.id,
            "amount": amount,
            "debit_credit": debit_credit,
            "type": type
        }
    
    def update_journal_entry(self, entry_data, type, table, total_amount, due_date):
        entry_id = entry_data.get('id')                
        entry = None
        if type == "journal":
            entry = JournalEntries.objects.get(journal=table, id=entry_id)
        elif type == "purchase":
            if hasattr(table, 'bill') and table.bill is not None:
                bill = table.bill
                if entry_data.get('type') == 'bill' and due_date and bill:
                    total_amount = entry_data.get('amount')
                    amount_due = total_amount - bill.amount_paid
                    if amount_due > 0:
                        if bill.amount_paid > total_amount:
                            raise serializers.ValidationError(
                                f"Amount paid {bill.amount_paid} cannot be more than bill total amount {total_amount}"
                            )

                        bill.total_amount = total_amount
                        bill.amount_due = amount_due
                        bill.due_date = due_date

                        if bill.amount_paid == total_amount:
                            bill.status = "paid"
                        elif bill.amount_paid == 0:
                            bill.status = "unpaid"
                        else:
                            bill.status = "partially_paid"

                        bill.save()
                    else:
                        raise serializers.ValidationError('Amount due can not  be negative')
                elif (entry_data.get('type') == 'bill' and not due_date):
                    raise serializers.ValidationError(f"Due date is required for bill")

               
            if entry_data.get('type') == 'purchase' and entry_data.get('amount') != total_amount:
                raise serializers.ValidationError(f"Purchase entries amount {total_amount} not equal to purchase account amount {entry_data.get('amount')}")
            entry = JournalEntries.objects.get(purchase=table, id=entry_id)


        elif type == "purchase_return":
            entry = JournalEntries.objects.get(purchase_return=table, id=entry_id)

        elif type == "sales":
            if hasattr(table, 'invoice') and table.invoice is not None:
                invoice = table.invoice
                if entry_data.get('type') == 'invoice' and due_date and invoice:
                    total_amount = entry_data.get('amount')
                    amount_due = total_amount - invoice.amount_paid
                    if amount_due > 0:
                        if invoice.amount_paid > total_amount:
                            raise serializers.ValidationError(
                                f"Amount paid {invoice.amount_paid} cannot be more than bill total amount {total_amount}"
                            )

                        invoice.total_amount = total_amount
                        invoice.amount_due = amount_due
                        invoice.due_date = due_date

                        if invoice.amount_paid == total_amount:
                            invoice.status = "paid"
                        elif invoice.amount_paid == 0:
                            invoice.status = "unpaid"
                        else:
                            invoice.status = "partially_paid"

                        invoice.save()
                    else:
                        raise serializers.ValidationError('Amount due can not  be negative')
                elif (entry_data.get('type') == 'invoice' and not due_date):
                    raise serializers.ValidationError(f"Due date is required for invoice")

            
            if entry_data.get('type') == 'sales' and entry_data.get('amount') != total_amount:
                raise serializers.ValidationError(f"Sales entries amount {total_amount} not equal to sales account amount {entry_data.get('amount')}")
            entry = JournalEntries.objects.get(sales=table, id=entry_id)

        elif type == "sales_return":
            entry = JournalEntries.objects.get(sales_return=table, id=entry_id)
        elif type == "payments":
            entry = JournalEntries.objects.get(payments=table, id=entry_id)
        elif type == "service_income":
            if hasattr(table, 'invoice') and table.invoice is not None:
                invoice = table.invoice
                if entry_data.get('type') == 'invoice' and due_date and invoice:
                    total_amount = entry_data.get('amount')
                    amount_due = total_amount - invoice.amount_paid
                    if amount_due > 0:
                        if invoice.amount_paid > total_amount:
                            raise serializers.ValidationError(
                                f"Amount paid {invoice.amount_paid} cannot be more than bill total amount {total_amount}"
                            )

                        invoice.total_amount = total_amount
                        invoice.amount_due = amount_due
                        invoice.due_date = due_date

                        if invoice.amount_paid == total_amount:
                            invoice.status = "paid"
                        elif invoice.amount_paid == 0:
                            invoice.status = "unpaid"
                        else:
                            invoice.status = "partially_paid"

                        invoice.save()
                    else:
                        raise serializers.ValidationError('Amount due can not  be negative')
                elif (entry_data.get('type') == 'invoice' and not due_date):
                    raise serializers.ValidationError(f"Due date is required for invoice")

           
            if entry_data.get('type') == 'service_income' and entry_data.get('amount') != total_amount:
                raise serializers.ValidationError(f"Service income entries amount {total_amount} not equal to service income account amount {entry_data.get('amount')}")
            entry = JournalEntries.objects.get(service_income=table, id=entry_id)
        else:
            raise serializers.ValidationError("Invalid choice: Valid choices are 'journal', 'purchase', 'sales', 'purchase_return', 'payments', 'service_income' or 'sales_return'")
        
        if entry is not None:
            update_entry_data = entry_data.copy()
            update_entry_data['amount'] = float(entry.amount) - float(entry_data.get('amount'))
            if entry_data.get("debit_credit") == "credit":
                update_entry_data['debit_credit'] = 'debit'
            elif entry_data.get("debit_credit") == "debit":
                update_entry_data['debit_credit'] = 'credit'
                
            account = self.get_account(update_entry_data)
            entry_data['account'] = account

            entry.amount = entry_data.get('amount')
            entry.debit_credit = entry_data.get('debit_credit')
            entry.account = entry_data.get('account')
            entry.save()
        else:
            raise serializers.ValidationError(f"Journal entry id {entry_id} not found")

        return entry.id


        
    def update_journal_entries(self, journal_entries_data, type: str, table, total_amount=0, due_date=None):
        entries_id = []
        is_bill_invoice = False
        for entry_data in journal_entries_data:
            if entry_data.get('type') in ['bill', 'invoice']:
                is_bill_invoice = True
            if entry_data.get('id'):
                entry_id = self.update_journal_entry(entry_data=entry_data, type=type, table=table, total_amount=total_amount, due_date=due_date)
                entries_id.append(entry_id)
            else:
                entry_id = self.add_journal_entry(entry_data=entry_data, type=type, table=table, due_date=due_date, total_amount=total_amount)
                entries_id.append(entry_id)
        if not is_bill_invoice:
            bill_invoice = None
            if type == 'purchase' and hasattr(table, 'bill'):
                bill_invoice = table.bill
            elif type in ['sales', 'service_income'] and hasattr(table, 'invoice'):
                bill_invoice = table.invoice
            if bill_invoice:
                bill_invoice.delete()
            
        return entries_id
        