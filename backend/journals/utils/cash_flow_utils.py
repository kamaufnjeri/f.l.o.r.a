from datetime import datetime, timedelta

from django.db.models import Q
from collections import defaultdict
from journals.models import (
    JournalEntries, Sales, ServiceIncome, Purchase, Journal, SalesReturn, PurchaseReturn, Payment
)


from journals.utils.account_utils import AccountUtils


class CashFlowUtils:
    """
    IAS 7 Cash Flow Statement (Direct Method)

    This utility is built around JournalEntries rather than balances.

    Algorithm

        1. Find every cash journal entry.
        2. Determine its parent transaction.
        3. Load every journal entry in that transaction.
        4. Find the opposite account(s).
        5. Classify as:
            • Operating
            • Investing
            • Financing
        6. Build the cash flow statement.

    The cash account only tells us whether
    cash increased or decreased.

    The opposite account(s) determine WHY,
    which determines the activity.
    """

    # =====================================================
    # Constructor
    # =====================================================

    def __init__(self, organisation, period=None):

        self.organisation = organisation
        self.period = period

        self.cash_sub_category = "Cash and Cash Equivalents"

    # =====================================================
    # Date Helpers
    # =====================================================

    def get_start_date(self):

        today = datetime.today().date()

        if self.period:

            if self.period == "today":
                return today

            elif self.period == "yesterday":
                return today - timedelta(days=1)

            elif self.period == "this_week":
                return today - timedelta(
                    days=today.weekday()
                )

            elif self.period == "this_month":
                return today.replace(day=1)

            elif (
                isinstance(self.period, str)
                and "to" in self.period
            ):

                return datetime.strptime(
                    self.period.split("to")[0],
                    "%Y-%m-%d",
                ).date()

        return None

    def get_end_date(self):

        today = datetime.today().date()

        if self.period:

            if self.period in (
                "today",
                "this_week",
                "this_month",
            ):
                return today

            elif self.period == "yesterday":
                return today - timedelta(days=1)

            elif (
                isinstance(self.period, str)
                and "to" in self.period
            ):

                return datetime.strptime(
                    self.period.split("to")[1],
                    "%Y-%m-%d",
                ).date()

        return today

    # =====================================================
    # Generic Date Filter
    # =====================================================

    def apply_date_filter(self, queryset):
        """
        Filters JournalEntries using the date
        of whichever transaction they belong to.

        Every JournalEntry belongs to exactly
        one source document.

            Journal
            Purchase
            Purchase Return
            Sales
            Sales Return
            Payment
            Service Income
            Opening
        """

        start = self.get_start_date()
        end = self.get_end_date()

        if start:

            queryset = queryset.filter(

                Q(
                    journal__date__gte=start,
                    journal__isnull=False,
                ) |

                Q(
                    purchase__date__gte=start,
                    purchase__isnull=False,
                ) |

                Q(
                    purchase_return__date__gte=start,
                    purchase_return__isnull=False,
                ) |

                Q(
                    sales__date__gte=start,
                    sales__isnull=False,
                ) |

                Q(
                    sales_return__date__gte=start,
                    sales_return__isnull=False,
                ) |

                Q(
                    payments__date__gte=start,
                    payments__isnull=False,
                ) |

                Q(
                    service_income__date__gte=start,
                    service_income__isnull=False,
                ) |

                Q(
                    opening__date__gte=start,
                    opening__isnull=False,
                )
            )

        if end:

            queryset = queryset.filter(

                Q(
                    journal__date__lte=end,
                    journal__isnull=False,
                ) |

                Q(
                    purchase__date__lte=end,
                    purchase__isnull=False,
                ) |

                Q(
                    purchase_return__date__lte=end,
                    purchase_return__isnull=False,
                ) |

                Q(
                    sales__date__lte=end,
                    sales__isnull=False,
                ) |

                Q(
                    sales_return__date__lte=end,
                    sales_return__isnull=False,
                ) |

                Q(
                    payments__date__lte=end,
                    payments__isnull=False,
                ) |

                Q(
                    service_income__date__lte=end,
                    service_income__isnull=False,
                ) |

                Q(
                    opening__date__lte=end,
                    opening__isnull=False,
                )
            )

        return queryset

    # =====================================================
    # Cash Account Helpers
    # =====================================================

    def is_cash_account(self, account):
        """
        Returns True if an account belongs to
        Cash and Cash Equivalents.
        """

        return (
            account.belongs_to.name ==
            self.cash_sub_category
        )
    
    # =====================================================
    # Cash Account Helpers
    # =====================================================

    def get_cash_accounts(self):
        """
        Returns every account that belongs to the
        Cash and Cash Equivalents sub-category.

        Examples

            Cash
            Bank
            Petty Cash
            Mobile Money
        """

        return (
            self.organisation.accounts
            .filter(
                belongs_to__name=self.cash_sub_category,
            )
            .select_related(
                "belongs_to",
                "belongs_to__category",
                "belongs_to__category__group",
            )
            .order_by("name")
        )

    def get_opening_cash(self):
        """
        Calculates the opening cash balance by summing the
        opening balances of every cash account.

        Example

            Cash      Dr 10,000
            Bank      Dr 40,000

        Opening Cash = 50,000
        """

        opening_cash = 0

        for account in self.get_cash_accounts():

            util = AccountUtils(
                account,
                self.period,
            )

            opening = util.get_opening_balance()

            if not opening:
                continue

            amount = float(opening["amount"])

            if opening["debit_credit"] == "debit":
                opening_cash += amount
            else:
                opening_cash -= amount

        return opening_cash

    def get_closing_cash(self):
        """
        Calculates the closing balance of all
        cash and bank accounts.

        Example

            Cash      Dr 12,000
            Bank      Dr 58,000

        Closing Cash = 70,000
        """

        closing_cash = 0

        for account in self.get_cash_accounts():

            util = AccountUtils(
                account,
                self.period,
            )

            balance = util.get_account_balance()

            amount = float(balance["amount"])

            if balance["balance_type"] == "debit":
                closing_cash += amount
            else:
                closing_cash -= amount

        return closing_cash

    # =====================================================
    # Cash Journal Entries
    # =====================================================

    def get_cash_entries(self):
        """
        Returns only journal entries that affect
        cash or bank.

        Every cash movement appears exactly once here.

        The opposite entry (or entries) will later be used
        to determine whether the movement belongs to:

            • Operating
            • Investing
            • Financing

        Internal cash transfers such as

            Dr Bank
            Cr Cash

        will be ignored later because every opposite
        account is also a cash account.
        """

        entries = (
            JournalEntries.objects
            .filter(
                account__belongs_to__name=self.cash_sub_category,
            )
            .select_related(
                "account",
                "account__belongs_to",
                "account__belongs_to__category",
                "account__belongs_to__category__group",

                "journal",
                "purchase",
                "purchase_return",
                "sales",
                "sales_return",
                "payments",
                "service_income",
                "opening",
            )
            .order_by("created_at")
        )

        entries = list(self.apply_date_filter(entries))

        entries.sort(
            key=self.get_transaction_date
        )

        return entries
    
    def get_transaction_date(self, entry):

        if entry.journal:
            return entry.journal.date

        if entry.purchase:
            return entry.purchase.date

        if entry.purchase_return:
            return entry.purchase_return.date

        if entry.sales:
            return entry.sales.date

        if entry.sales_return:
            return entry.sales_return.date

        if entry.payments:
            return entry.payments.date

        if entry.service_income:
            return entry.service_income.date

        if entry.opening:
            return entry.opening.date

        # =====================================================
    # Transaction Helpers
    # =====================================================

    def get_transaction(self, entry):
        """
        Returns the parent transaction together with its type.

        Exactly one of these relationships should exist for
        every journal entry.
        """

        mapping = (
            ("journal", entry.journal),
            ("purchase", entry.purchase),
            ("purchase_return", entry.purchase_return),
            ("sales", entry.sales),
            ("sales_return", entry.sales_return),
            ("payment", entry.payments),
            ("service_income", entry.service_income),
            ("opening", entry.opening),
        )

        for transaction_type, transaction in mapping:
            if transaction is not None:
                return transaction, transaction_type

        return None, None

    def get_parent_entries(self, entry):
        """
        Returns every journal entry belonging to the same
        accounting transaction.

        Example

            Dr Cash              10,000
            Cr Sales             10,000

        Both entries are returned.
        """

        transaction, _ = self.get_transaction(entry)

        if transaction is None:
            return JournalEntries.objects.none()

        return (
            transaction.journal_entries
            .select_related(
                "account",
                "account__belongs_to",
                "account__belongs_to__category",
                "account__belongs_to__category__group",
            )
        )

    def get_transaction_date(self, entry):
        """
        Returns the accounting date of a journal entry.
        """

        transaction, _ = self.get_transaction(entry)

        if transaction is None:
            return None

        return transaction.date
        # =====================================================
    # Cash Flow Classification
    # =====================================================

    def is_cash_account(self, account):
        """
        Returns True if the account belongs to
        Cash and Cash Equivalents.
        """

        return (
            account.belongs_to.name ==
            self.cash_sub_category
        )

    def get_opposite_entries(self, cash_entry):
        """
        Returns every non-cash journal entry belonging to the
        same transaction.

        Example

            Dr Cash         5,000
            Cr Sales        5,000

        returns

            Sales

        Example

            Dr Bank        50,000
            Cr Cash        50,000

        returns []

        because both are cash accounts.
        """

        entries = self.get_parent_entries(cash_entry)

        opposite = []

        for entry in entries:

            if entry.id == cash_entry.id:
                continue

            if self.is_cash_account(entry.account):
                continue

            opposite.append(entry)

        return opposite

    # =====================================================
    # Process Cash Movements
    # =====================================================

    def get_cash_transactions(self):
        """
        Returns every transaction that contains at least
        one cash or bank journal entry.
        """

        transactions = {}

        for cash_entry in self.get_cash_entries():

            transaction, transaction_type = self.get_transaction(
                cash_entry
            )

            if transaction is None:
                continue

            key = (
                transaction_type,
                transaction.id,
            )

            transactions[key] = transaction

        return list(transactions.values())

    def process_transaction(self, transaction):
        """
        Process one accounting transaction into one cash flow movement.
        """

        cash_entries = []

        non_cash_entries = []

        for entry in transaction.journal_entries.select_related(
            "account",
            "account__belongs_to",
            "account__belongs_to__category",
            "account__belongs_to__category__group",
        ):

            if self.is_cash_account(entry.account):
                cash_entries.append(entry)
            else:
                non_cash_entries.append(entry)

        # No cash involved
        if not cash_entries:
            return []

        # Internal cash transfer (Cash -> Bank)
        if not non_cash_entries:
            return []

        # IAS 7 assumes one cash movement per transaction
        movements = []
        activity, line_item = self.classify_transaction(
            transaction=transaction,
            cash_entries=cash_entries,
            non_cash_entries=non_cash_entries,
        )
        for cash_entry in cash_entries:


            if activity is None:
                continue

            amount = float(cash_entry.amount)

            movements.append({
                "date": transaction.date,
                "activity": activity,
                "line_item": line_item,
                "description": transaction.description,
                "cash_account": cash_entry.account.name,
                "cash_in": amount if cash_entry.debit_credit == "debit" else 0,
                "cash_out": amount if cash_entry.debit_credit == "credit" else 0,
                "amount": amount,
            })

        return movements

    # =====================================================
    # Cash Flow Statement
    # =====================================================

    def get_cash_flow(self):

        operating = defaultdict(
            lambda: {
                "entries": [],
                "total": 0,
            }
        )

        investing = defaultdict(
            lambda: {
                "entries": [],
                "total": 0,
            }
        )

        financing = defaultdict(
            lambda: {
                "entries": [],
                "total": 0,
            }
        )

        operating_total = 0
        investing_total = 0
        financing_total = 0

        processed = set()

        transactions = self.get_cash_transactions()

        for transaction in transactions:

            movements = self.process_transaction(
                transaction
            )


            for movement in movements:

                amount = movement["amount"]

                if movement["cash_out"] > 0:
                    amount *= -1

                movement["net_amount"] = amount

                activity = movement["activity"]

                if activity == "Operating":

                    line = operating[movement["line_item"]]

                    line["entries"].append(movement)
                    line["total"] += amount

                    operating_total += amount


                elif activity == "Investing":

                    line = investing[movement["line_item"]]

                    line["entries"].append(movement)
                    line["total"] += amount

                    investing_total += amount


                elif activity == "Financing":

                    line = financing[movement["line_item"]]

                    line["entries"].append(movement)
                    line["total"] += amount

                    financing_total += amount

        opening_cash = self.get_opening_cash()

        closing_cash = self.get_closing_cash()

        net_cash_flow = (

            operating_total +

            investing_total +

            financing_total

        )

        return {

            "operating": {

                "entries": operating,

                "total": operating_total,

            },

            "investing": {

                "entries": investing,

                "total": investing_total,

            },

            "financing": {

                "entries": financing,

                "total": financing_total,

            },

            "opening_cash": opening_cash,

            "net_cash_flow": net_cash_flow,

            "closing_cash": closing_cash,

            "reconciles": (

                round(

                    opening_cash +

                    net_cash_flow,

                    2,

                )

                ==

                round(

                    closing_cash,

                    2,

                )

            ),

        }

      
    def classify_transaction(
        self,
        transaction,
        cash_entries,
        non_cash_entries,
    ):
        """
        Determines the IAS 7 classification for a transaction.

        cash_entries:
            Every Cash/Bank/Petty Cash/Mobile Money entry.

        non_cash_entries:
            Every opposite entry.

        The same classification is applied to every cash movement
        belonging to the transaction.
        """

        if isinstance(transaction, Payment):

            if transaction.invoice:
                return (
                    "Operating",
                    "Cash received from customers",
                )

            if transaction.bill:
                return (
                    "Operating",
                    "Cash paid to suppliers",
                )

        elif isinstance(transaction, Sales):
            return (
                "Operating",
                "Cash received from customers",
            )

        elif isinstance(transaction, SalesReturn):
            return (
                "Operating",
                "Refunds to customers",
            )

        elif isinstance(transaction, Purchase):
            return (
                "Operating",
                "Cash paid to suppliers",
            )

        elif isinstance(transaction, PurchaseReturn):
            return (
                "Operating",
                "Refunds from suppliers",
            )

        elif isinstance(transaction, ServiceIncome):
            return (
                "Operating",
                "Cash received from services",
            )

        elif isinstance(transaction, Journal):
            return self.classify_journal(
                cash_entries=cash_entries,
                opposite_entries=non_cash_entries,
            )

        return self.unclassified(
            "Unsupported transaction type"
        )

    def classify_journal(
        self,
        cash_entries,
        opposite_entries,
    ):
        """
        Classifies a general journal.

        Supports:

            Dr Cash      400
            Dr Bank      600
            Cr Capital 1000

        and

            Cr Cash      300
            Cr Bank      700
            Dr Equipment 1000

        without assuming there is only one cash account.
        """

        if not cash_entries:

            return self.unclassified(
                "No cash entries found"
            )


        if not opposite_entries:

            return self.unclassified(
                "Cash transfer or incomplete journal"
        )

        total_cash_in = sum(
            float(entry.amount)
            for entry in cash_entries
            if entry.debit_credit == "debit"
        )

        total_cash_out = sum(
            float(entry.amount)
            for entry in cash_entries
            if entry.debit_credit == "credit"
        )

        is_receipt = total_cash_in >= total_cash_out

        for opposite in opposite_entries:

            account = opposite.account

            group = account.belongs_to.category.group.name
            category = account.belongs_to.category.name

            # -------------------------
            # Financing Activities
            # -------------------------

            if group == "Capital":

                return (
                    "Financing",
                    "Owner contribution"
                    if is_receipt
                    else "Owner drawings",
                )

            if (
                group == "Liability"
                and category == "Non-Current Liability"
            ):

                return (
                    "Financing",
                    "Loan proceeds"
                    if is_receipt
                    else "Loan repayment",
                )

            # -------------------------
            # Investing Activities
            # -------------------------

            if (
                group == "Asset"
                and category == "Non-Current Asset"
            ):

                return (
                    "Investing",
                    "Sale of non-current assets"
                    if is_receipt
                    else "Purchase of non-current assets",
                )

            # -------------------------
            # Operating Activities
            # -------------------------

            if group == "Income":

                return (
                    "Operating",
                    "Other operating receipts",
                )

            if group == "Expense":

                return (
                    "Operating",
                    "Operating expenses",
                )

            if account.belongs_to.name == "Accounts Receivable":

                return (
                    "Operating",
                    "Cash received from customers",
                )

            if account.belongs_to.name == "Accounts Payable":

                return (
                    "Operating",
                    "Cash paid to suppliers",
                )

        return (
            "Operating",
            "Other operating activities",
        )
    def unclassified(self, reason):
        return {
            "activity": None,
            "line_item": None,
            "reason": reason,
        }