from journals.models import Customer, Supplier, Service, JournalEntries
from journals.models import (
    Purchase,
    Sales,
    PurchaseReturn,
    SalesReturn,
    ServiceIncome,
    Payment,
    Journal,
)
from datetime import datetime, timedelta
from .account_utils import AccountUtils
from .stock_utils import StockUtils


class DashboardUtils:


    def __init__(self, organisation, accounts, stocks, period=None):
        self.organisation = organisation
        self.accounts = accounts
        self.stocks = stocks
        self.period = period

     # ==================================================
    # PERIODS
    # ==================================================

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


    def get_recent_transactions(self):

        transactions = []

        sources = [
            (
                Purchase,
                "Purchase",
                "/purchases/",
                lambda x: x.bill.supplier.name if x.bill.supplier else None,
            ),

            (
                Sales,
                "Sales",
                "/sales/",
                lambda x: x.invoice.customer.name if x.invoice.customer else None,
            ),

            (
                PurchaseReturn,
                "Purchase Return",
                "/purchase-returns/",
                lambda x: None,

            ),

            (
                SalesReturn,
                "Sales Return",
                "/sales-returns/",
                lambda x: None,

            ),

            (
                ServiceIncome,
                "Service Income",
                "/service-income/",
                lambda x: x.invoice.customer.name if x.invoice.customer else None,
            ),

            (
                Payment,
                "Payment",
                "/payments/",
                lambda x: None,
            ),

            (
                Journal,
                "Journal",
                "/journals/",
                lambda x: None,
            ),
        ]


        for model, type_name, url, party in sources:

            query = model.objects.filter(
                organisation=self.organisation
            )

            if self.period:
                query = query.filter(
                    date__gte=self.get_start_date(),
                    date__lte=self.get_end_date()
                )

            item = query.order_by("-date").first()

            if item:

                user = getattr(item, "user", None)


                transactions.append(
                    {
                        "id": str(item.id),

                        "serial_number": getattr(
                            item,
                            "serial_number",
                            None
                        ),

                        "type": type_name,

                        "description": item.description,

                        "date": item.date,

                        "supplier_name": (
                            party(item)
                            if type_name in [
                                "Purchase",
                                "Purchase Return"
                            ]
                            else None
                        ),

                        "customer_name": (
                            party(item)
                            if type_name in [
                                "Sales",
                                "Sales Return",
                                "Service Income"
                            ]
                            else None
                        ),

                        "url": f"{url}{item.id}",

                        "entered_by": (
                            user.get_full_name()
                            if user
                            else None
                        ),
                    }
                )


        return sorted(
            transactions,
            key=lambda x: x["date"],
            reverse=True
        )

    def get_opening_closing_stock(self):
            opening_stock_total = 0
            closing_stock_total = 0
            stocks = []
    
            for stock in self.stocks:
                util = StockUtils(stock, self.period)
    
                _, _, opening_stock, closing_stock = util.get_closing_balance()
    
    
                if opening_stock:
                    opening_stock_total += float(opening_stock["amount"])
                if closing_stock:
                    stocks.append({
                        "id": stock.id,
                        "name": stock.name,
                        "rate": closing_stock['rate'],
                        "quantity": closing_stock["quantity"],
                        'amount': closing_stock["amount"],
                    })
                    closing_stock_total += float(closing_stock["amount"])
    
                
            return {
                "stocks": stocks,
                "closing_stock": closing_stock_total,
                "opening_stock": opening_stock_total,
                'inventory': closing_stock_total - opening_stock_total
            }

    # ==================================================
    # ACCOUNT BALANCE
    # ==================================================

    def get_account_balance(self, account):

        util = AccountUtils(
            account,
            self.period
        )

        balance = util.get_account_balance()

        amount = balance["amount"]
        balance_type = balance["balance_type"]

        return {
            "id": account.id,
            "name": account.name,
            "amount": amount,
            "balance_type": balance_type,
            "debit": balance["debit"],
            "credit": balance["credit"],
        }

    # ==================================================
    # PERIOD AMOUNT
    # ==================================================

    def get_period_amount(self, account, normal_balance):

        util = AccountUtils(
            account,
            self.period
        )

        period = util.get_period_amount(normal_balance)

        amount = period["amount"]

        return {
            "id": account.id,
            "name": account.name,
            "amount": amount,
            "balance_type": normal_balance,
            "debit": period["debit"],
            "credit": period["credit"],
        }

    def get_dashboard(self):

        cash = 0
        receivable = 0
        payable = 0

        total_sales = 0
        total_sales_returns = 0

        total_purchases = 0
        total_purchase_returns = 0

        total_service_income = 0
        total_other_income = 0
        total_expenses = 0

        accounts = (
            self.accounts
            .select_related(
                "belongs_to",
                "belongs_to__category",
                "belongs_to__category__group",
            )
        )

        for account in accounts:

            group = account.belongs_to.category.group.name
            category = account.belongs_to.category.name
            sub_category = account.belongs_to.name
            account_name = account.name.lower()

            # =================================================
            # INCOME
            # Same logic as IncomeStatementUtils
            # =================================================

            if group.lower() == "income":

                if sub_category.lower() == "product sales":

                    balance = self.get_period_amount(account, "credit")
                    total_sales += float(balance["amount"])

                elif account_name == "sales return":

                    balance = self.get_period_amount(account, "debit")
                    total_sales_returns += float(balance["amount"])

                elif sub_category.lower() == "service income":

                    balance = self.get_period_amount(account, "credit")
                    total_service_income += float(balance["amount"])

                else:

                    balance = self.get_period_amount(account, "credit")
                    total_other_income += float(balance["amount"])

            elif group.lower() == "expense":

                if account_name == "purchase":

                    balance = self.get_period_amount(account, "debit")
                    total_purchases += float(balance["amount"])

                elif account_name == "purchase return":

                    balance = self.get_period_amount(account, "credit")
                    total_purchase_returns += float(balance["amount"])

                else:

                    balance = self.get_period_amount(account, "debit")
                    total_expenses += float(balance["amount"])

            elif group.lower() == "asset":

                balance = self.get_account_balance(account)
                amount = float(balance["amount"])

                if sub_category.lower() == "cash and cash equivalents":
                    cash += amount

                elif sub_category.lower() == "accounts receivable":
                    receivable += amount

            elif group.lower() == "liability":

                balance = self.get_account_balance(account)
                amount = float(balance["amount"])

                if sub_category.lower() == "accounts payable":
                    payable += amount

        # =================================================
        # INVENTORY
        # =================================================

        inventory = self.get_opening_closing_stock()

        opening_stock = inventory["opening_stock"]
        closing_stock = inventory["closing_stock"]

        # =================================================
        # PROFIT
        # Same calculation as IncomeStatementUtils
        # =================================================

        net_sales = (
            total_sales -
            total_sales_returns
        )

        net_purchases = (
            total_purchases -
            total_purchase_returns
        )

        goods_available = (
            opening_stock +
            net_purchases
        )

        cost_of_goods_sold = (
            goods_available -
            closing_stock
        )

        gross_profit = (
            net_sales -
            cost_of_goods_sold
        )

        total_income = (
            gross_profit +
            total_service_income +
            total_other_income
        )

        net_profit = (
            total_income -
            total_expenses
        )

        # =================================================
        # RESPONSE
        # =================================================

        return {

            "summary": {

                "cash": cash,

                "receivables": receivable,

                "payables": payable,

                "inventory": inventory,

                "profit": net_profit,

            },

            "income_expense": {

                "sales": total_sales,

                "sales_returns": total_sales_returns,

                "net_sales": net_sales,

                "purchases": total_purchases,

                "purchase_returns": total_purchase_returns,

                "net_purchases": net_purchases,

                "opening_stock": opening_stock,

                "closing_stock": closing_stock,

                "goods_available_for_sale": goods_available,

                "cost_of_goods_sold": cost_of_goods_sold,

                "gross_profit": gross_profit,

                "total_service_income": total_service_income,

                "total_other_income": total_other_income,

                "total_income": total_income,

                "expenses": total_expenses,

                "profit": net_profit,

            },

            "recent_transactions":
                self.get_recent_transactions(),

            "quick_stats":
                self.get_quick_stats(),

        }

    def get_quick_stats(self):

        return {

            "customers":
                Customer.objects.filter(
                    organisation=self.organisation
                ).count(),


            "suppliers":
                Supplier.objects.filter(
                    organisation=self.organisation
                ).count(),

            "accounts":
                self.accounts.count(),


            "products":
                self.stocks.count(),

            "services":
                Service.objects.filter(
                    organisation=self.organisation
                ).count(),
                
        

        }


   