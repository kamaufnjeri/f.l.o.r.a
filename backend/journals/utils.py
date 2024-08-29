from .models import Account, SalesEntries, SalesPurchasePrice, JournalEntries
from .models import PurchaseEntries, Stock, PurchaseReturnEntries, SalesReturnEntries
from rest_framework import serializers
import decimal


def create_journal_entries(journal_entries_data, type: str, table, AccountDetailsSerializer):
    for entry_data in journal_entries_data:
        account_id = entry_data.get('account')
        try:
            account = Account.objects.get(id=account_id)
            account_serializer = AccountDetailsSerializer(account).data
            current_balance = account_serializer.get('account_balance')
            category = account_serializer.get('category')

            if (
                (
                    category in ("asset", "expense") and entry_data.get('debit_credit') == "credit"
                ) or (
                        category in ("liability", "capital", "income") and entry_data.get('debit_credit') == "debit"
                    )
            ) and current_balance < entry_data.get('amount'):
                raise serializers.ValidationError(
                    f'Account {account_serializer.get("name")} has insufficient balance'
                )
        except Account.DoesNotExist:
            raise serializers.ValidationError(f"Account with id {account_id} not found")
                
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
        


def validate_journal_entries(journal_entries):
    format = [
        {"account": 1, "amount": 2000.00, "debit_credit": "debit"},
        {"account": 2, "amount": 2000.00, "debit_credit": "credit"}
    ]
    if not journal_entries:
        raise serializers.ValidationError(f"Journal entries required in the format: {str(format)}")
def validate_double_entry(journal_entries):
    debit_total = sum(entry.get('amount') for entry in journal_entries  if entry.get('debit_credit') == 'debit')
    credit_total = sum(entry.get('amount') for entry in journal_entries  if entry.get('debit_credit') == 'credit')
    

    if debit_total != credit_total:
        raise serializers.ValidationError("For every journal entered the debit and credit amounts need to be equal")
    
def create_purchase_entries(purchase_entries_data, purchase):
    cogs = 0.00
    for entry in purchase_entries_data:
        stock_id= entry.get('stock')
        try:
            stock = Stock.objects.get(id=stock_id)
        except Stock.DoesNotExist:
            raise serializers.ValidationError(f"Stock with id {stock_id} not found")
                
        entry['stock'] = stock
        purchase_quantity = entry.get('purchased_quantity')
        purchase_price = entry.get('purchase_price')
        purchase_cogs = purchase_price * purchase_quantity
        cogs += float(purchase_cogs)
        PurchaseEntries.objects.create(
            purchase=purchase,
            cogs=purchase_cogs,
            remaining_quantity=purchase_quantity,
            **entry
        )

    return cogs

def validate_purchase_entries(purchase_entries):
    format = [
        {"stock": 1, "purchase_price": 20.00, "purchase_quantity": 100},
        {"stock": 2, "purchase_price": 40.00, "purchase_quantity": 100}
    ]

    if not purchase_entries:
        raise serializers.ValidationError(f"Purchase entries required in the format: {str(format)}")
    
def create_purchase_return_entries(return_entries, purchase_return, purchase):
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

def validate_purchase_return_entries(return_entries):
    format = [
        {'purchase': 1, "return_quantity": 2},
        {"purchase": 3,"return_quantity": 4}
    ]

    if not return_entries:
        raise serializers.ValidationError(f"Purchase return entries required in the format: {str(format)}")
    
def get_payment_account(journal_entries, AccountDetailsSerializer):
    for entry in journal_entries:
        account_id = entry.get('account')
        
        account = Account.objects.get(id=account_id)

        if account:
            account_serializer = AccountDetailsSerializer(account).data

            if (account_serializer.get('category') == "asset" and account_serializer.get('sub_category') == "current_asset") or (
                account_serializer.get('name') == 'Opening Stock'
            ):
                return account
            else:
                raise serializers.ValidationError("No payment account or Accounts Payable account found")

def cost_of_goods_sold(sales_entry, purchase_entries):
    remaining_quantity = sales_entry.sold_quantity
    cogs = 0.00
    
    for entry in purchase_entries:
        quantity_to_use = min(entry.remaining_quantity, remaining_quantity)
        sales_purchase_cogs = entry.purchase_price * quantity_to_use
        cogs += float(sales_purchase_cogs)
        remaining_quantity -= quantity_to_use
        entry.remaining_quantity -= quantity_to_use
        entry.save()

        # Create SalesPurchasePrice entry for each quantity used
        SalesPurchasePrice.objects.create(
            sales_entry=sales_entry,
            purchase_entry=entry,
            purchase_price=entry.purchase_price,
            sales_price=sales_entry.sales_price,
            sold_quantity=quantity_to_use,
            initial_quantity=quantity_to_use
        )

        if remaining_quantity <= 0:
            break

    if remaining_quantity > 0:
        raise serializers.ValidationError("Insufficient inventory to sell the specified quantity.")
        
    return cogs

def create_sales_entries(sales_entries, sales, StockDetaileSerializer):
    cogs = 0.00
    total_sales_price = 0.00
    for entry in sales_entries:
        stock_id= entry.get('stock')
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
        purchase_entries = PurchaseEntries.objects.filter(
            stock=stock,
            remaining_quantity__gt=0
        ).order_by('purchase__date')
    
        sales_entry = SalesEntries.objects.create(
            sales=sales,
            initial_quantity=sold_quantity,
            **entry
        )
        sales_cogs = cost_of_goods_sold(sales_entry, purchase_entries)
        sales_entry.cogs = sales_cogs
        cogs += float(sales_cogs)
        sales_entry.save()

    return cogs, total_sales_price

def validate_sales_entries(sales_entries):
    format = [
        {"stock": 1, "sales_price": 20.00, "sold_quantity": 100},
        {"stock": 2, "sales_price": 40.00, "sold_quantity": 100}
    ]

    if not sales_entries:
        raise serializers.ValidationError(f"Sales entries required in the format: {str(format)}")
    
def get_receipt_account(journal_entries, AccountDetailsSerializer):
    for entry in journal_entries:
        account_id = entry.get('account')
        
        account = Account.objects.get(id=account_id)

        if account:
            account_serializer = AccountDetailsSerializer(account).data

            if (
                (
                    account_serializer.get('category') == "asset" and account_serializer.get('sub_category') == "current_asset"
                 ) or (
                    account_serializer.get('category') == "liability" and account_serializer.get('sub_category') == "current_liability"

                 )
            ):
                return account
            else:
                raise serializers.ValidationError("No payment account or Accounts Payable account found")

def journal_entries_dict(journal_entries, cogs, total_sales_price):
    inventory_account = Account.objects.get(name="Inventory")
    cogs_account = Account.objects.get(name="Cost of goods sold")
    sales_revenue_account = Account.objects.get(name="Sales Revenue")


    inventory_account_data = {
        "account": inventory_account.id,
        "amount": decimal.Decimal(cogs),
        "debit_credit": "credit"
    }

    sales_revenue_data = {
        "account": sales_revenue_account.id,
        "amount": decimal.Decimal(total_sales_price),
        "debit_credit": "credit"
    }

    cogs_data = {
        "account": cogs_account.id,
        "amount": decimal.Decimal(cogs),
        "debit_credit": "debit"
    }
    journal_entries.append(inventory_account_data)
    journal_entries.append(sales_revenue_data)
    journal_entries.append(cogs_data)

    return journal_entries

def validate_sales_return_entries(return_entries):
    format = [
        {'sales': 1, "return_quantity": 2},
        {"sales": 3,"return_quantity": 4}
    ]

    if not return_entries:
        raise serializers.ValidationError(f"Sales return entries required in the format: {str(format)}")
    
def create_sales_return_entries(return_entries, sales_return, sales):
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

        sales_returns_cogs, _ = reverse_fifo(sales_purchase_price_entries, return_quantity)
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

def reverse_fifo(sales_purchase_price_entries, return_quantity):
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
