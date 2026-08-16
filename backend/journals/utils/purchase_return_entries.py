from journals.models import PurchaseReturnEntries, PurchaseEntries, Account
from rest_framework import serializers
from .journal_entries import JournalEntriesManager
from django.db import transaction
from rest_framework.exceptions import ValidationError
import decimal
from django.db.models import Sum

journal_entry_manager = JournalEntriesManager()


class PurchaseReturnEntriesManager:
    def apply_discount(self, price, discount_percentage):
        try:
            if discount_percentage is not None:
                discount = decimal.Decimal(discount_percentage)
                return price * (1 - (discount / 100))
        except (TypeError, ValueError):
            raise ValidationError("Invalid discount percentage provided.")
        return price
    
    @transaction.atomic
    def create_purchase_return_entry(
        self,
        entry,
        purchase_return,
        purchase,
        discount_percentage
    ):
        purchase_entry_id = entry.get('purchase_entry')

        try:
            purchase_entry = PurchaseEntries.objects.get(
                id=purchase_entry_id,
                purchase=purchase
            )
        except PurchaseEntries.DoesNotExist:
            raise ValidationError(
                f"Purchase entry with ID {purchase_entry_id} not found."
            )

        return_quantity = entry.get('return_quantity')

        if return_quantity <= 0:
            raise ValidationError(
                "Return quantity must be greater than zero."
            )

        # Calculate returns that already exist
        existing_returns = (
            PurchaseReturnEntries.objects
            .filter(purchase_entry=purchase_entry)
            .aggregate(total=Sum('return_quantity'))
            ['total'] or 0
        )

        available_quantity = (
            purchase_entry.purchased_quantity - existing_returns
        )

        if return_quantity > available_quantity:
            raise ValidationError(
                f"Cannot return {return_quantity} items. "
                f"Only {available_quantity} available."
            )

        return_price = self.apply_discount(
            decimal.Decimal(purchase_entry.purchase_price),
            discount_percentage
        )

        stock_total_return_price = (
            return_price * decimal.Decimal(return_quantity)
        )

        entry['purchase_entry'] = purchase_entry

        purchase_return_entry = PurchaseReturnEntries.objects.create(
            purchase_return=purchase_return,
            cogs=stock_total_return_price,
            purchase_price=purchase_entry.purchase_price,
            return_price=return_price,
            stock=purchase_entry.stock,
            **entry
        )

        # Recalculate instead of increment/decrement
        total_returns = (
            PurchaseReturnEntries.objects
            .filter(purchase_entry=purchase_entry)
            .aggregate(total=Sum('return_quantity'))
            ['total'] or 0
        )

        purchase_entry.remaining_quantity = (
            purchase_entry.purchased_quantity - total_returns
        )

        purchase_entry.save()

        return stock_total_return_price, purchase_return_entry.id
    
    def create_purchase_return_entries(self, return_entries, purchase_return, purchase, discount_percentage):
        total_return_price = 0.00
        for entry in return_entries:
            return_price, _ = self.create_purchase_return_entry(
                entry=entry,
                purchase_return=purchase_return,
                purchase=purchase,
                discount_percentage=discount_percentage
            )
            total_return_price += float(return_price)

        return total_return_price

    @transaction.atomic
    def update_purchase_return_entry(
        self,
        entry,
        purchase_return,
        purchase,
        discount_percentage
    ):
        purchase_entry_id = entry.get('purchase_entry')
        purchase_return_entry_id = entry.get('id')
        return_quantity = entry.get('return_quantity')

        if return_quantity <= 0:
            raise ValidationError(
                "Return quantity must be greater than zero."
            )

        try:
            new_purchase_entry = PurchaseEntries.objects.get(
                id=purchase_entry_id,
                purchase=purchase
            )
        except PurchaseEntries.DoesNotExist:
            raise ValidationError(
                f"Purchase entry with id {purchase_entry_id} not found"
            )

        try:
            purchase_return_entry = PurchaseReturnEntries.objects.get(
                id=purchase_return_entry_id,
                purchase_return=purchase_return
            )
        except PurchaseReturnEntries.DoesNotExist:
            raise ValidationError(
                f"Purchase return entry with id {purchase_return_entry_id} not found"
            )

        old_purchase_entry = purchase_return_entry.purchase_entry

        # --------------------------------------------------
        # If moving the return to another purchase entry
        # --------------------------------------------------

        if old_purchase_entry.id != new_purchase_entry.id:

            # Restore old purchase entry by removing its old return
            old_returns = (
                PurchaseReturnEntries.objects
                .filter(purchase_entry=old_purchase_entry)
                .exclude(id=purchase_return_entry.id)
                .aggregate(total=Sum('return_quantity'))
                ['total'] or 0
            )

            old_purchase_entry.remaining_quantity = (
                old_purchase_entry.purchased_quantity - old_returns
            )

            # Check new purchase entry
            new_returns = (
                PurchaseReturnEntries.objects
                .filter(purchase_entry=new_purchase_entry)
                .exclude(id=purchase_return_entry.id)
                .aggregate(total=Sum('return_quantity'))
                ['total'] or 0
            )

            available_quantity = (
                new_purchase_entry.purchased_quantity - new_returns
            )

            if return_quantity > available_quantity:
                raise ValidationError(
                    f"Cannot return {return_quantity} items. "
                    f"Only {available_quantity} available."
                )

            new_purchase_entry.remaining_quantity = (
                new_purchase_entry.purchased_quantity
                - new_returns
                - return_quantity
            )

            old_purchase_entry.save()
            new_purchase_entry.save()

        # --------------------------------------------------
        # Same purchase entry
        # --------------------------------------------------

        else:

            other_returns = (
                PurchaseReturnEntries.objects
                .filter(purchase_entry=new_purchase_entry)
                .exclude(id=purchase_return_entry.id)
                .aggregate(total=Sum('return_quantity'))
                ['total'] or 0
            )

            available_quantity = (
                new_purchase_entry.purchased_quantity
                - other_returns
            )

            if return_quantity > available_quantity:
                raise ValidationError(
                    f"Cannot return {return_quantity} items. "
                    f"Only {available_quantity} available."
                )

            new_purchase_entry.remaining_quantity = (
                new_purchase_entry.purchased_quantity
                - other_returns
                - return_quantity
            )

            new_purchase_entry.save()

        # --------------------------------------------------
        # Update return entry
        # --------------------------------------------------

        return_price = self.apply_discount(
            decimal.Decimal(new_purchase_entry.purchase_price),
            discount_percentage
        )

        stock_total_return_price = (
            return_price * decimal.Decimal(return_quantity)
        )

        purchase_return_entry.return_quantity = return_quantity
        purchase_return_entry.return_price = return_price
        purchase_return_entry.purchase_price = new_purchase_entry.purchase_price
        purchase_return_entry.cogs = stock_total_return_price
        purchase_return_entry.stock = new_purchase_entry.stock
        purchase_return_entry.purchase_entry = new_purchase_entry

        purchase_return_entry.save()

        return stock_total_return_price, purchase_return_entry.id
            
           
    def update_purchase_return_entries(self, return_entries, purchase_return, purchase, discount_percentage):
        total_return_price = 0.00
        entries_id = []
        for entry in return_entries:
            if entry.get('id'):
                return_price, entry_id = self.update_purchase_return_entry(
                    entry=entry,
                    purchase_return=purchase_return,
                    purchase=purchase,
                    discount_percentage=discount_percentage
                )
                total_return_price += float(return_price)
                entries_id.append(entry_id)
            else:
                return_price, entry_id = self.create_purchase_return_entry(
                    entry=entry,
                    purchase_return=purchase_return,
                    purchase=purchase,
                    discount_percentage=discount_percentage
                )
                total_return_price += float(return_price)
                entries_id.append(entry_id)

        return total_return_price, entries_id

           
    
    def validate_purchase_return_entries(self, return_entries):
        format = [
            {'purchase_entry': 1, "return_quantity": 2},
            {"purchase_entry": 3,"return_quantity": 4}
        ]

        if not return_entries:
            raise serializers.ValidationError(f"Purchase return entries required in the format: {str(format)}")
        

    def purchase_return_journal_entries(self, purchase_journal_entries, total_return_price, purchase, purchase_return, updating=False):
        journal_entries = []
        remaining_amount = total_return_price
        bill = getattr(purchase, 'bill', None)


        for entry in purchase_journal_entries:
            if remaining_amount <= 0:
                break

            account_data, amount_to_use = self.return_account_entry(
                entry=entry, remaining_amount=remaining_amount,
                bill=bill, updating=updating, purchase_return=purchase_return
            )

            remaining_amount -= float(amount_to_use)

            journal_entries.extend(account_data)

        if remaining_amount > 0:
            raise serializers.ValidationError('Total purchase price of returned stocks is more than amount received')
        
        return journal_entries

    
    

    def get_account(self, entry):
        account_id = entry.get('account')

        try:
            account = Account.objects.get(id=account_id)
        except Account.DoesNotExist:
            raise serializers.ValidationError(f'Account with ID {account_id} not found')
        
        return account
    
    def return_account_entry(self, entry, remaining_amount, purchase_return, bill=None, updating=False):
        account_data = []
        amount_to_use = 0
        
        if entry.get('type') in ("payment", "bill") and entry.get('debit_credit') == 'credit':
            account = self.get_account(entry)

            if str(account.belongs_to).strip().lower() in ("cash and cash equivalents", "accounts payable"):

                amount_to_use = min(decimal.Decimal(entry.get('amount')), remaining_amount)

                if entry.get('type') == 'bill' and str(account.belongs_to).strip().lower() == 'accounts payable' and bill:
                   
                    from journals.serializers import PaymentsDetailSerializer
                    payments = PaymentsDetailSerializer(bill.payment.all(), many=True).data

                    payment_remaining_amount = amount_to_use

                    if payments:
                        for payment in payments:
                            for payment_entry in payment.get('journal_entries'):
                                payment_account = self.get_account(payment_entry)
                                if str(payment_account.belongs_to).strip().lower() in ("cash and cash equivalents") and payment_entry.get('debit_credit') == 'credit' and payment_entry.get('type') == 'payment':
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
                            previous_amount = purchase_return.bill_amount
                            total_amount = bill.total_amount + previous_amount - decimal.Decimal(amount_to_use)
                        else:
                            total_amount = bill.total_amount - decimal.Decimal(amount_to_use)
                        purchase_return.bill_amount = amount_to_use

                        amount_due = total_amount - bill.amount_paid
                        self.adjust_bill(total_amount=total_amount, amount_due=amount_due, bill=bill)
                        
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
    
    
    def adjust_bill(self, total_amount, amount_due, bill):
        if amount_due >= 0:
            if bill.amount_paid > total_amount:
                raise serializers.ValidationError(
                    f"Amount paid {bill.amount_paid} cannot be more than bill total amount {total_amount}"
                )
            bill.total_amount = total_amount
            bill.amount_due = amount_due

            if bill.amount_paid == total_amount:
                bill.status = "paid"
            elif bill.amount_paid == 0:
                bill.status = "unpaid"
            else:
                bill.status = "partially_paid"
            bill.save()
        else:
            raise serializers.ValidationError('Amount due can not  be negative')