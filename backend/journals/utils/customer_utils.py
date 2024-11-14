from datetime import datetime, timedelta
from django.db.models import Q
from journals.models import JournalEntries

class CustomerUtils:
    def __init__(self, customer, period=None):
        self.customer = customer
        self.period = period

    def get_opening_balance(self):
        start_date = self.get_start_date()

        _, amount_due, amount_paid = self.get_customer_invoices(before_date=start_date)

        
        
        return {
            'date': start_date,
            'description': 'Opening balance',
            'invoice_type': 'Opening balance',
            'amount_due': amount_due,
            'amount_paid': amount_paid,
            
        }
       


    def get_customer_data(self):
        customer_data = self.get_sorted_customer_invoices()
        return customer_data

    def get_invoice_date_description_type(self, invoice):
        if invoice.journal:
            return invoice.journal.date, invoice.journal.description, 'Journal'
        elif invoice.sales:
            return invoice.sales.date, invoice.sales.description, 'Sales'
        elif invoice.service_income:
            return invoice.service_income.date, invoice.service_income.description, 'Service Income'
        else:
            return self.get_start_date(), 'Default', 'Default'
        

    def get_customer_invoices(self, before_date=None, after_date=None):

        customer_invoices = self.customer.invoices.all()

        if before_date:
            customer_invoices = customer_invoices.filter(
                (Q(journal__date__lt=before_date) & Q(journal__date__isnull=False)) |
                (Q(sales__date__lt=before_date) & Q(sales__date__isnull=False)) |
                (Q(service_income__date__lt=before_date) & Q(service_income__date__isnull=False))
            )

        if after_date:
            customer_invoices = customer_invoices.filter(
                (Q(journal__date__gte=after_date) & Q(journal__date__isnull=False)) |
                (Q(sales__date__gte=after_date) & Q(sales__date__isnull=False)) |
                (Q(service_income__date__gte=after_date) & Q(service_income__date__isnull=False))
            )

        
        amount_due, amount_paid = 0, 0
        invoices = []
        today = datetime.today().date()
        for invoice in customer_invoices:
            amount_due += float(invoice.amount_due)
            amount_paid += float(invoice.amount_paid)
            date, description, invoice_type = self.get_invoice_date_description_type(invoice)

            due_diff = invoice.due_date - today
            due_days = due_diff.days

            if due_days < 0 and invoice.status != "paid":
                due_days = f"Overdue by {(-1 * due_days)} days"
            elif due_days > 0:
                due_days = f"{due_days} days"
            else:
                due_days = "Not due"

            invoices.append({
                'date': date,
                'description': description,
                'invoice_type': invoice_type,
                'amount_due': invoice.amount_due,
                'amount_paid': invoice.amount_paid,
                'invoice_no': invoice.serial_number, 
                'due_date': invoice.due_date,
                'due_days': due_days,
                'status': invoice.status.title().replace('_', ' ')
            })

        return invoices, amount_due, amount_paid
    
    def get_customer_invoices_data(self):
        start_date = self.get_start_date()
        end_date = self.get_end_date() + timedelta(days=1)

        entries, amount_due, amount_paid = self.get_customer_invoices(after_date=start_date, before_date=end_date)

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
                return self.customer.created_at.date()
        else:
            return self.customer.created_at.date()

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

    def get_sorted_customer_invoices(self):
        opening_balance = self.get_opening_balance()
        customer_invoices, amount_due, amount_paid = self.get_customer_invoices_data()

        sorted_customer_invoices = sorted(customer_invoices, key=lambda x: x.get('date'))

        if opening_balance:
            sorted_customer_invoices.insert(0, opening_balance)
            amount_due += opening_balance.get('amount_due')
            amount_paid += opening_balance.get('amount_paid')


        return {
            'invoices': sorted_customer_invoices,
            "totals": {
                'amount_due': amount_due,
                'amount_paid': amount_paid
            }
        }

    

    