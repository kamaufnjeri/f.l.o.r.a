from journals.models import SalesReturnEntries, SalesEntries, Account
from rest_framework import serializers
from .journal_entries import JournalEntriesManager
from django.db import transaction
from rest_framework.exceptions import ValidationError
import decimal

journal_entry_manager = JournalEntriesManager()


class SalesReturnEntriesManager:
    def apply_discount(self, price, discount_percentage):
        try:
            if discount_percentage is not None:
                discount = decimal.Decimal(discount_percentage)
                return price * (1 - (discount / 100))
        except (TypeError, ValueError):
            raise ValidationError("Invalid discount percentage provided.")
        return price

    @transaction.atomic
    def create_sales_return_entry(self, entry, sales_return, sales, discount_percentage):
        sales_entry_id = entry.get('sales_entry')
        try:
            sales_entry = SalesEntries.objects.get(id=sales_entry_id, sales=sales)
        except SalesEntries.DoesNotExist:
            raise ValidationError(f"Sales entry with ID {sales_entry_id} not found.")
        entry['sales_entry'] = sales_entry

        return_quantity = entry.get('return_quantity')
        if return_quantity <= 0:
            raise ValidationError("Return quantity must be greater than zero.")

        if sales_entry.remaining_quantity >= return_quantity:
            # Deduct return quantity from remaining quantity
            sales_entry.remaining_quantity -= return_quantity

            # Calculate the return price
            return_price = self.apply_discount(decimal.Decimal(sales_entry.sales_price), discount_percentage)
            stock_total_return_price = return_price * decimal.Decimal(return_quantity)

            # Create the sales return entry
            sales_return_entry = SalesReturnEntries.objects.create(
                sales_return=sales_return,
                cogs=stock_total_return_price,
                sales_price=sales_entry.sales_price,
                return_price=return_price,
                stock=sales_entry.stock,
                **entry
            )

            # Save the updated sales entry
            sales_entry.save()

            return stock_total_return_price, sales_return_entry.id
        else:
            raise ValidationError(
                f"Cannot return {return_quantity} items. Only {sales_entry.remaining_quantity} available."
            )

    def create_sales_return_entries(self, return_entries, sales_return, sales, discount_percentage):
        total_return_price = 0.00
        for entry in return_entries:
            return_price, _ = self.create_sales_return_entry(
                entry=entry,
                sales_return=sales_return,
                sales=sales,
                discount_percentage=discount_percentage
            )
            total_return_price += float(return_price)

        return total_return_price
    
    def update_sales_return_entry(self, entry, sales_return, sales, discount_percentage):
        sales_entry_id = entry.get('sales_entry')
        sales_return_entry_id = entry.get('id')

        try:
            new_sales_entry = SalesEntries.objects.get(id=sales_entry_id, sales=sales)
        except SalesEntries.DoesNotExist:
            raise serializers.ValidationError(f"Sales entry with id {sales_entry_id} not found")
        
        try:
            sales_return_entry = SalesReturnEntries.objects.get(
                id=sales_return_entry_id,
                sales_return=sales_return
            )
        except SalesReturnEntries.DoesNotExist:
            raise serializers.ValidationError(f"Sales return entry with id {sales_return_entry_id} not found")
        
        return_quantity = entry.get('return_quantity')

        old_sales_entry = sales_return_entry.sales_entry
        
        if old_sales_entry.id == new_sales_entry.id:
            quantity_diff = sales_return_entry.return_quantity - return_quantity
            new_remaining_quantity = new_sales_entry.remaining_quantity + quantity_diff

            if new_remaining_quantity >= 0:
                new_sales_entry.remaining_quantity = new_remaining_quantity

            else:
                raise serializers.ValidationError(f"Remaining quantity can't be negative")

        else:
            new_remaining_quantity = new_sales_entry.remaining_quantity - return_quantity

            if new_remaining_quantity >= 0:
                old_sales_entry.remaining_quantity += sales_return_entry.return_quantity
                new_sales_entry.remaining_quantity = new_remaining_quantity
            else:
                raise serializers.ValidationError(f"Remaining quantity can't be negative")

        stock = new_sales_entry.stock

        return_price = new_sales_entry.sales_price
        return_price = self.apply_discount(decimal.Decimal(new_sales_entry.sales_price), discount_percentage)

        stock_total_return_price = return_price * return_quantity

        sales_price = new_sales_entry.sales_price

        sales_return_entry.cogs = stock_total_return_price
        sales_return_entry.sales_price = sales_price
        sales_return_entry.return_quantity = return_quantity
        sales_return_entry.return_price = return_price
        sales_return_entry.stock = stock
        sales_return_entry.sales_entry = new_sales_entry

        old_sales_entry.save()
        new_sales_entry.save()
        sales_return_entry.save()

        return stock_total_return_price, sales_return_entry.id
        
           
    def update_sales_return_entries(self, return_entries, sales_return, sales, discount_percentage):
        total_return_price = 0.00
        entries_id = []
        for entry in return_entries:
            if entry.get('id'):
                return_price, entry_id = self.update_sales_return_entry(
                    entry=entry,
                    sales_return=sales_return,
                    sales=sales,
                    discount_percentage=discount_percentage
                )
                total_return_price += float(return_price)
                entries_id.append(entry_id)
            else:
                return_price, entry_id = self.create_sales_return_entry(
                    entry=entry,
                    sales_return=sales_return,
                    sales=sales,
                    discount_percentage=discount_percentage
                )
                total_return_price += float(return_price)
                entries_id.append(entry_id)

        return total_return_price, entries_id

           
    
    def validate_sales_return_entries(self, return_entries):
        format = [
            {'sales_entry': 1, "return_quantity": 2},
            {"sales_entry": 3,"return_quantity": 4}
        ]

        if not return_entries:
            raise serializers.ValidationError(f"Sales return entries required in the format: {str(format)}")
        

    def sales_return_journal_entries(self, sales_journal_entries, total_return_price, sales, sales_return, updating=False):
        journal_entries = []
        remaining_amount = total_return_price
        invoice = getattr(sales, 'invoice', None)


        for entry in sales_journal_entries:
            if remaining_amount <= 0:
                break

            account_data, amount_to_use = self.return_account_entry(
                entry=entry, remaining_amount=remaining_amount,
                invoice=invoice, updating=updating, sales_return=sales_return
            )
            remaining_amount -= float(amount_to_use)


            journal_entries.extend(account_data)

        if remaining_amount > 0:
            raise serializers.ValidationError('Total price of returned stocks is more than amount received')
        
        return journal_entries

    

    def get_account(self, entry):
        account_id = entry.get('account')

        try:
            account = Account.objects.get(id=account_id)
        except Account.DoesNotExist:
            raise serializers.ValidationError(f'Account with ID {account_id} not found')
        
        return account
    
    def return_account_entry(self, entry, remaining_amount, sales_return, invoice=None, updating=False):
        account_data = []
        amount_to_use = 0
        
        if entry.get('type') in ("payment", "invoice") and entry.get('debit_credit') == 'debit':
            account = self.get_account(entry)

            if str(account.belongs_to).strip().lower() in ("cash and cash equivalents", "accounts receivable"):

                amount_to_use = min(decimal.Decimal(entry.get('amount')), remaining_amount)

                if entry.get('type') == 'invoice' and str(account.belongs_to).strip().lower() == 'accounts receivable' and invoice:
                   
                    from journals.serializers import PaymentsDetailSerializer
                    payments = PaymentsDetailSerializer(invoice.payment.all(), many=True).data

                    payment_remaining_amount = amount_to_use

                    if payments:
                        for payment in payments:
                            for payment_entry in payment.get('journal_entries'):
                                payment_account = self.get_account(payment_entry)
                                print(payment_account.belongs_to)
                                if str(payment_account.belongs_to).strip().lower() in ("cash and cash equivalents") and payment_entry.get('debit_credit') == 'debit' and payment_entry.get('type') == 'payment':
                                    payment_amount_to_use = min(decimal.Decimal(payment_entry.get('amount')), payment_remaining_amount)
                                    if payment_remaining_amount <= 0:
                                        break
                                    payment_entry_type = payment_entry.get('type')
                                    account_data.append(journal_entry_manager.create_journal_entry(payment_account, payment_amount_to_use, "debit", payment_entry_type))
                                    payment_remaining_amount -= payment_amount_to_use
                                    
                    if payment_remaining_amount > 0:
                        amount_to_use = payment_remaining_amount
                        total_amount = 0
                        if updating:
                            previous_amount = sales_return.invoice_amount
                            total_amount = invoice.total_amount + previous_amount - decimal.Decimal(amount_to_use)
                        else:
                            total_amount = invoice.total_amount - decimal.Decimal(amount_to_use)
                        sales_return.invoice_amount = amount_to_use

                        amount_due = total_amount - invoice.amount_paid
                        self.adjust_invoice(total_amount=total_amount, amount_due=amount_due, invoice=invoice)
                        
                        entry_type = entry.get('type')
                        account_data.append(journal_entry_manager.create_journal_entry(account, amount_to_use, "debit", entry_type))

                        remaining_amount -= amount_to_use

                        if remaining_amount > 0: 
                            raise serializers.ValidationError('Total price of returned stocks is more than amount received')                   

                    else:
                        pass
                else:
                    entry_type = entry.get('type')
                    account_data.append(journal_entry_manager.create_journal_entry(account, amount_to_use, "debit", entry_type))

        return account_data, amount_to_use
    
    
    def adjust_invoice(self, total_amount, amount_due, invoice):
        if amount_due >= 0:
            if invoice.amount_paid > total_amount:
                raise serializers.ValidationError(
                    f"Amount paid {invoice.amount_paid} cannot be more than invoice total amount {total_amount}"
                )
            invoice.total_amount = total_amount
            invoice.amount_due = amount_due

            if invoice.amount_paid == total_amount:
                invoice.status = "paid"
            elif invoice.amount_paid == 0:
                invoice.status = "unpaid"
            else:
                invoice.status = "partially_paid"
            invoice.save()
        else:
            raise serializers.ValidationError('Amount due can not  be negative')