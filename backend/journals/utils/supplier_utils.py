from datetime import datetime, timedelta
from django.db.models import Q
from journals.models import JournalEntries

class SupplierUtils:
    def __init__(self, supplier, period=None):
        self.supplier = supplier
        self.period = period

    def get_opening_balance(self):
        start_date = self.get_start_date()

        _, amount_due, amount_paid = self.get_supplier_bills(before_date=start_date)

        
        
        return {
            'date': start_date,
            'description': 'Opening balance',
            'bill_type': 'Opening balance',
            'amount_due': amount_due,
            'amount_paid': amount_paid,
            
        }
       


    def get_supplier_data(self):
        supplier_data = self.get_sorted_supplier_bills()
        return supplier_data

    def get_bill_date_description_type(self, bill):
        if bill.journal:
            return bill.journal.date, bill.journal.description, 'Journal'
        elif bill.purchase:
            return bill.purchase.date, bill.purchase.description, 'Purchase'
       
        else:
            return self.get_start_date(), 'Default', 'Default'
        

    def get_supplier_bills(self, before_date=None, after_date=None):

        supplier_bills = self.supplier.bills.all()

        if before_date:
            supplier_bills = supplier_bills.filter(
                (Q(journal__date__lt=before_date) & Q(journal__date__isnull=False)) |
                (Q(purchase__date__lt=before_date) & Q(purchase__date__isnull=False))
            )

        if after_date:
            supplier_bills = supplier_bills.filter(
                (Q(journal__date__gte=after_date) & Q(journal__date__isnull=False)) |
                (Q(purchase__date__gte=after_date) & Q(purchase__date__isnull=False)) 
            )

        
        amount_due, amount_paid = 0, 0
        bills = []
        today = datetime.today().date()
        for bill in supplier_bills:
            amount_due += float(bill.amount_due)
            amount_paid += float(bill.amount_paid)
            date, description, bill_type = self.get_bill_date_description_type(bill)

            due_diff = bill.due_date - today
            due_days = due_diff.days

            if due_days < 0 and bill.status != "paid":
                due_days = f"Overdue by {(-1 * due_days)} days"
            elif due_days > 0:
                due_days = f"{due_days} days"
            else:
                due_days = "Not due"

            bills.append({
                'date': date,
                'description': description,
                'bill_type': bill_type,
                'amount_due': bill.amount_due,
                'amount_paid': bill.amount_paid,
                'due_date': bill.due_date,
                'due_days': due_days,
                'bill_no': bill.serial_number,
                'status': bill.status.title().replace('_', ' ')
            })

        return bills, amount_due, amount_paid
    
    def get_supplier_bills_data(self):
        start_date = self.get_start_date()
        end_date = self.get_end_date() + timedelta(days=1)

        entries, amount_due, amount_paid = self.get_supplier_bills(after_date=start_date, before_date=end_date)

        return entries, amount_due, amount_paid

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
                return self.supplier.created_at.date()
        else:
            return self.supplier.created_at.date()

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

    def get_sorted_supplier_bills(self):
        opening_balance = self.get_opening_balance()
        supplier_bills, amount_due, amount_paid = self.get_supplier_bills_data()

        sorted_supplier_bills = sorted(supplier_bills, key=lambda x: x.get('date'))

        if opening_balance:
            sorted_supplier_bills.insert(0, opening_balance)
            amount_due += opening_balance.get('amount_due')
            amount_paid += opening_balance.get('amount_paid')


        return {
            'bills': sorted_supplier_bills,
            "totals": {
                'amount_due': amount_due,
                'amount_paid': amount_paid
            }
        }

    

    