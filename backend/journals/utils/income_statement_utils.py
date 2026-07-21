from journals.utils.stock_utils import StockUtils
from journals.utils.account_utils import AccountUtils
from datetime import datetime, timedelta
from collections import defaultdict


class IncomeStatementUtils:

    def __init__(self, stocks, accounts, period=None):
        self.stocks = stocks
        self.accounts = accounts
        self.period = period
    
    def get_start_date(self):
        today = datetime.today().date()

        if self.period:
            if self.period == "today":
                return today

            elif self.period == "yesterday":
                return today - timedelta(days=1)

            elif self.period == "this_week":
                return today - timedelta(days=today.weekday())

            elif self.period == "this_month":
                return today.replace(day=1)

            elif "to" in self.period:
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

            elif "to" in self.period:
                return datetime.strptime(
                    self.period.split("to")[1],
                    "%Y-%m-%d",
                ).date()

        return today
    
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
            "opening_stock": opening_stock_total
        }
    def get_account_balance(self, account):
       

        util = AccountUtils(account, self.period)

        balance = util.get_account_balance()

        amount = balance["amount"]
        balance_type = balance["balance_type"]

        return {
            "id": account.id,
            "name": account.name,
            "amount": amount,
            "balance_type": balance_type,
            "debit": amount if balance_type == "debit" else 0,
            "credit": amount if balance_type == "credit" else 0,
        }
    

    def get_income_statement(self):
        stock_data = self.get_opening_closing_stock()

        opening_stock = stock_data["opening_stock"]
        closing_stock = stock_data["closing_stock"]

        stocks = stock_data["stocks"]

        sales_accounts = []
        purchase_accounts = []
        service_income_accounts = []

        sales_return_account = None
        purchase_return_account = None

        expenses = defaultdict(
            lambda: {
                "sub_categories": defaultdict(
                    lambda: {
                        "accounts": [],
                        "total": 0,
                    }
                ),
                "total": 0,
            }
        )

        other_income = defaultdict(
            lambda: {
                "sub_categories": defaultdict(
                    lambda: {
                        "accounts": [],
                        "total": 0,
                    }
                ),
                "total": 0,
            }
        )

        total_sales = 0
        total_sales_returns = 0

        total_purchases = 0
        total_purchase_returns = 0

        total_service_income = 0
        total_other_income = 0
        total_expenses = 0

        for account in self.accounts:
            balance = self.get_account_balance(account)

            group = account.belongs_to.category.group.name
            category = account.belongs_to.category.name
            sub_category = account.belongs_to.name
            account_name = account.name.lower()

            amount = float(balance["amount"])

            # ---------------------------
            # INCOME
            # ---------------------------

            if group.lower() == "income":

                if sub_category.lower() == "product sales":

                    sales_accounts.append(balance)
                    total_sales += amount

                elif account_name == "sales return":

                    sales_return_account = balance
                    total_sales_returns = amount

                elif sub_category.lower() == "service income":

                    service_income_accounts.append(balance)
                    total_service_income += amount

                else:

                    other_income[category]["sub_categories"][sub_category]["accounts"].append(balance)
                    other_income[category]["sub_categories"][sub_category]["total"] += amount
                    other_income[category]["total"] += amount
                    total_other_income += amount


            # ---------------------------
            # EXPENSES
            # ---------------------------

            elif group.lower() == "expense":

                if account_name == "purchase":

                    purchase_accounts.append(balance)
                    total_purchases += amount

                elif account_name == "purchase return":

                    purchase_return_account = balance
                    total_purchase_returns = amount

                else:

                    expenses[category]["sub_categories"][sub_category]["accounts"].append(balance)
                    expenses[category]["sub_categories"][sub_category]["total"] += amount
                    expenses[category]["total"] += amount
                    total_expenses += amount

        # ---------------------------
        # CALCULATIONS
        # ---------------------------

        net_sales = total_sales - total_sales_returns

        net_purchases = total_purchases - total_purchase_returns

        goods_available = opening_stock + net_purchases

        cost_of_goods_sold = goods_available - closing_stock

        gross_profit = net_sales - cost_of_goods_sold

        operating_profit = (
            gross_profit
            + total_service_income
            + total_other_income
        )

        net_profit = operating_profit - total_expenses

        return {
            "sales": {
                "accounts": sales_accounts,
                "total": total_sales,
            },

            "sales_return": sales_return_account,

            "net_sales": net_sales,

            "opening_stock": {
                "amount": opening_stock,
            },

            "purchases": {
                "accounts": purchase_accounts,
                "total": total_purchases,
            },

            "purchase_return": purchase_return_account,

            "net_purchases": net_purchases,

            "goods_available_for_sale": goods_available,

            "closing_stock": {
                "amount": closing_stock,
                "stocks": stocks,
            },

            "cost_of_goods_sold": cost_of_goods_sold,

            "gross_profit": gross_profit,

            "service_income": {
                "accounts": service_income_accounts,
                "total": total_service_income,
            },

            "other_income": {
               "categories": dict(other_income),
                "total": total_other_income,
            },
            "operating_profit": operating_profit,

            "expenses": {
                "categories": dict(expenses),
                "total": total_expenses,
            },

            "net_profit": net_profit,
        }