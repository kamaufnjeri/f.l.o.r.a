from datetime import datetime, timedelta
from django.db.models import Q
from journals.models import JournalEntries

class AccountUtils:
    def __init__(self, account, period=None):
        self.account = account
        self.period = period

    def get_opening_balance(self):
        start_date = self.get_start_date()

        _, debit_total, credit_total = self.get_account_entries(before_date=start_date)

        print('start date', start_date)

        if self.account.opening_balance and self.account.opening_balance > 0:
            if self.account.opening_balance_type == 'debit':
                debit_total +=  float(self.account.opening_balance)
            else:
                credit_total +=  float(self.account.opening_balance)
        
        if debit_total > 0 or credit_total > 0:
            return self.get_balance_type(debit_total, credit_total, 'Opening balance', start_date)
        return None

    def get_balance_type(self, debit_total, credit_total, type, date):
        balance = 0
        balance_type = ''
        if debit_total > credit_total:
            balance = debit_total - credit_total
            balance_type = 'debit'
        else:
            balance = credit_total - debit_total
            balance_type = 'credit'

        return {
                'details': {
                    'date': date,
                    'description': type,
                    'type': type
                },
                'amount': balance,
                'debit_credit': balance_type,

            }

                


    def get_closing_balance(self):
        start_date = self.get_start_date()
        end_date = self.get_end_date() + timedelta(days=1)

        _, debit_total, credit_total = self.get_account_entries(after_date=start_date, before_date=end_date)

        opening_entry = self.get_opening_balance()
        
        if opening_entry:
            if opening_entry.get('debit_credit') == 'debit':
                debit_total += opening_entry.get('amount')
            else:
                credit_total += opening_entry.get('amount')

        return opening_entry, self.get_balance_type(debit_total, credit_total, 'Closing balance', self.get_end_date())

    def get_account_data(self):
        account_data = self.get_sorted_journal_entries()
        return account_data

        

    def get_account_entries(self, before_date=None, after_date=None):

        journal_entries = self.account.journal_entries.all()

        if before_date:
            journal_entries = journal_entries.filter(
                (Q(journal__date__lt=before_date) & Q(journal__date__isnull=False)) |
                (Q(sales__date__lt=before_date) & Q(sales__date__isnull=False)) |
                (Q(purchase__date__lt=before_date) & Q(purchase__date__isnull=False)) |
                (Q(purchase_return__date__lt=before_date) & Q(purchase_return__date__isnull=False)) |
                (Q(sales_return__date__lt=before_date) & Q(sales_return__date__isnull=False)) |
                (Q(payments__date__lt=before_date) & Q(payments__date__isnull=False)) |
                (Q(service_income__date__lt=before_date) & Q(service_income__date__isnull=False))
            )

        if after_date:
            journal_entries = journal_entries.filter(
                (Q(journal__date__gte=after_date) & Q(journal__date__isnull=False)) |
                (Q(sales__date__gte=after_date) & Q(sales__date__isnull=False)) |
                (Q(purchase__date__gte=after_date) & Q(purchase__date__isnull=False)) |
                (Q(purchase_return__date__gte=after_date) & Q(purchase_return__date__isnull=False)) |
                (Q(sales_return__date__gte=after_date) & Q(sales_return__date__isnull=False)) |
                (Q(payments__date__gte=after_date) & Q(payments__date__isnull=False)) |
                (Q(service_income__date__gte=after_date) & Q(service_income__date__isnull=False))
            )

        from journals.serializers import DetailedJournalEntryEntrySerializer
        
        entries_serializer_data = DetailedJournalEntryEntrySerializer(journal_entries, many=True).data

        debit_total = sum(float(entry.get('amount')) for entry in entries_serializer_data if entry.get('debit_credit') == 'debit')
        credit_total = sum(float(entry.get('amount')) for entry in entries_serializer_data if entry.get('debit_credit') == 'credit')
        

        return entries_serializer_data, debit_total, credit_total
    
    def get_journal_entries(self):
        start_date = self.get_start_date()
        end_date = self.get_end_date() + timedelta(days=1)

        entries, debit_totals, credit_totals = self.get_account_entries(after_date=start_date, before_date=end_date)

        return entries, debit_totals, credit_totals


   


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
                return self.account.created_at.date()
        else:
            return self.account.created_at.date()

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

    def get_sorted_journal_entries(self):
        journal_entries, debit_total, credit_total = self.get_journal_entries()
        opening_entry, closing_entry = self.get_closing_balance()

        sorted_journal_entries = sorted(journal_entries, key=lambda x: x.get('details').get('date'))

        if opening_entry:
            sorted_journal_entries.insert(0, opening_entry)

            if opening_entry.get('debit_credit') == 'debit':
                debit_total += opening_entry.get('amount')
            else:
                credit_total += opening_entry.get('amount')

        if closing_entry:
            closing_balance = closing_entry.copy()

            if closing_entry.get('debit_credit') == 'debit':
                closing_balance['debit_credit'] = 'credit'

                credit_total += closing_entry.get('amount')
            else:
                debit_total += closing_entry.get('amount')
                closing_balance['debit_credit'] = 'debit'

            sorted_journal_entries.append(closing_balance)

        return {
            'entries': sorted_journal_entries,
            "totals": {
                'closing': closing_entry,
                'debit': debit_total,
                'credit': credit_total
            }
        }

    

    