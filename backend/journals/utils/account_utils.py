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

    def get_period_amount(self, normal_balance):
        start_date = self.get_start_date()
        end_date = self.get_end_date() + timedelta(days=1)

        _, debit_total, credit_total = self.get_account_entries(
            after_date=start_date,
            before_date=end_date
        )

        if normal_balance == "credit":
            amount = credit_total - debit_total
        elif normal_balance == "debit":
            amount = debit_total - credit_total
        else:
            raise ValueError(
                "normal_balance must be either 'debit' or 'credit'"
            )

        return {
            "amount": amount,
            "debit": debit_total,
            "credit": credit_total,
            "balance_type": normal_balance,
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

        journal_entries = self.account.journal_entries.exclude(type="opening_balance")
        if before_date:
            journal_entries = journal_entries.filter(
                (Q(journal__date__lt=before_date) & Q(journal__date__isnull=False)) |
                (Q(sales__date__lt=before_date) & Q(sales__date__isnull=False)) |
                (Q(purchase__date__lt=before_date) & Q(purchase__date__isnull=False)) |
                (Q(purchase_return__date__lt=before_date) & Q(purchase_return__date__isnull=False)) |
                (Q(sales_return__date__lt=before_date) & Q(sales_return__date__isnull=False)) |
                (Q(payments__date__lt=before_date) & Q(payments__date__isnull=False)) |
                (Q(service_income__date__lt=before_date) & Q(service_income__date__isnull=False)) |
                (Q(opening__date__lt=before_date) & Q(opening__date__isnull=False))

            )

        if after_date:
            journal_entries = journal_entries.filter(
                (Q(journal__date__gte=after_date) & Q(journal__date__isnull=False)) |
                (Q(sales__date__gte=after_date) & Q(sales__date__isnull=False)) |
                (Q(purchase__date__gte=after_date) & Q(purchase__date__isnull=False)) |
                (Q(purchase_return__date__gte=after_date) & Q(purchase_return__date__isnull=False)) |
                (Q(sales_return__date__gte=after_date) & Q(sales_return__date__isnull=False)) |
                (Q(payments__date__gte=after_date) & Q(payments__date__isnull=False)) |
                (Q(service_income__date__gte=after_date) & Q(service_income__date__isnull=False)) |
                (Q(opening__date__gte=after_date) & Q(opening__date__isnull=False))

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

        if not self.period:
            return today

        if self.period == "today":
            return today

        if self.period == "yesterday":
            return today - timedelta(days=1)

        if self.period == "this_week":
            return today - timedelta(days=today.weekday())

        if self.period == "this_month":
            return today.replace(day=1)

        # Date range
        if isinstance(self.period, str) and "to" in self.period:
            try:
                start_date_str = self.period.split("to", 1)[0].strip()
                return datetime.strptime(
                    start_date_str,
                    "%Y-%m-%d"
                ).date()
            except (ValueError, IndexError):
                return today

        # Single custom date
        try:
            return datetime.strptime(
                self.period.strip(),
                "%Y-%m-%d"
            ).date()
        except (ValueError, TypeError):
            return today

    def get_end_date(self):
        today = datetime.today().date()

        if not self.period:
            return today

        if self.period == "today":
            return today

        if self.period == "yesterday":
            return today - timedelta(days=1)

        if self.period == "this_week":
            return today

        if self.period == "this_month":
            return today

        # Date range
        if isinstance(self.period, str) and "to" in self.period:
            try:
                end_date_str = self.period.split("to", 1)[1].strip()
                return datetime.strptime(
                    end_date_str,
                    "%Y-%m-%d"
                ).date()
            except (ValueError, IndexError):
                return today

        # Single custom date
        try:
            return datetime.strptime(
                self.period.strip(),
                "%Y-%m-%d"
            ).date()
        except (ValueError, TypeError):
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

    

    def get_account_balance(self):
        """
        Returns the account's natural balance.

        Unlike the ledger's closing balance (Balance c/d),
        this returns the side on which the account actually
        has its balance.

        Example:
            Debit = 2,000
            Credit = 1,500

            Returns:
            {
                "amount": 500,
                "balance_type": "debit"
            }
        """

        start_date = self.get_start_date()
        end_date = self.get_end_date() + timedelta(days=1)


        _, debit_total, credit_total = self.get_account_entries(
            after_date=start_date,
            before_date=end_date,
        )

        opening = self.get_opening_balance()

        if opening:
            if opening["debit_credit"] == "debit":
                debit_total += opening["amount"]
            else:
                credit_total += opening["amount"]

        print(self.account.name, 's', start_date, 'e', end_date, 'debit', debit_total, credit_total)


        if debit_total >= credit_total:
           return {
                "amount": debit_total - credit_total,
                "balance_type": "debit",
                "debit": debit_total,
                "credit": credit_total,
            }
        return {
            "amount": credit_total - debit_total,
            "balance_type": "credit",
            "debit": debit_total,
            "credit": credit_total,
        }


    def get_balance_as_at(self, as_at_date):
        """
        Returns the account's cumulative balance as at a specific date.
        """

        # Convert string -> date
        if isinstance(as_at_date, str):
            try:
                as_at_date = datetime.strptime(
                    as_at_date.strip(),
                    "%Y-%m-%d"
                ).date()
            except (ValueError, TypeError):
                return {
                    "amount": 0,
                    "balance_type": "debit",
                    "debit": 0,
                    "credit": 0,
                }

        end_date = as_at_date + timedelta(days=1)

        _, debit_total, credit_total = self.get_account_entries(
            before_date=end_date
        )

        # Add configured opening balance
        if self.account.opening_balance is not None:
            opening_balance = float(self.account.opening_balance)

            if self.account.opening_balance_type == "debit":
                debit_total += opening_balance
            else:
                credit_total += opening_balance

        print(
            self.account.name,
            "as at",
            as_at_date,
            "debit",
            debit_total,
            "credit",
            credit_total,
        )

        if debit_total >= credit_total:
            return {
                "amount": debit_total - credit_total,
                "balance_type": "debit",
                "debit": debit_total,
                "credit": credit_total,
            }

        return {
            "amount": credit_total - debit_total,
            "balance_type": "credit",
            "debit": debit_total,
            "credit": credit_total,
        }