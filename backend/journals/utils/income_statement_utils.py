from journals.utils.stock_utils import StockUtils
from journals.utils.account_utils import AccountUtils
from datetime import datetime, timedelta
from collections import defaultdict
from decimal import Decimal


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
            "opening_stock": opening_stock_total,
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
            "debit": balance["debit"],
            "credit": balance["credit"],
        }

    def get_period_amount(self, account, normal_balance):
        util = AccountUtils(account, self.period)

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
                        "accounts": []
                    }
                ),
                "total": 0,
            }
        )


        other_income = defaultdict(
            lambda: {
                "sub_categories": defaultdict(
                    lambda: {
                        "accounts": []
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

            group = account.belongs_to.category.group.name
            category = account.belongs_to.category.name
            sub_category = account.belongs_to.name
            account_name = account.name.lower()

            # ---------------------------------
            # INCOME STATEMENT ACCOUNTS
            # ---------------------------------

            if group.lower() == "income":

                if sub_category.lower() == "product sales":
                    balance = self.get_period_amount(account, "credit")

                    sales_accounts.append(balance)
                    total_sales += float(balance["amount"])

                elif account_name == "sales return":
                    balance = self.get_period_amount(account, "debit")

                    sales_return_account = balance
                    total_sales_returns += float(balance["amount"])

                elif sub_category.lower() == "service income":
                    balance = self.get_period_amount(account, "credit")

                    service_income_accounts.append(balance)
                    total_service_income += float(balance["amount"])

                else:
                    balance = self.get_period_amount(account, "credit")

                    other_income[category]["sub_categories"][sub_category]["accounts"].append(balance)
                    other_income[category]["total"] += float(balance["amount"])
                    total_other_income += float(balance["amount"])

            # ---------------------------------
            # EXPENSES
            # ---------------------------------

            elif group.lower() == "expense":

                if account_name == "purchase":
                    balance = self.get_period_amount(account, "debit")

                    purchase_accounts.append(balance)
                    total_purchases += float(balance["amount"])

                elif account_name == "purchase return":
                    balance = self.get_period_amount(account, "credit")

                    purchase_return_account = balance
                    total_purchase_returns += float(balance["amount"])

                else:
                    balance = self.get_period_amount(account, "debit")

                    expenses[category]["sub_categories"][sub_category]["accounts"].append(balance)
                    expenses[category]["total"] += float(balance["amount"])
                    total_expenses += float(balance["amount"])
        # ---------------------------
        # CALCULATIONS
        # ---------------------------

        net_sales = Decimal(str(total_sales)) - Decimal(str(total_sales_returns))

        net_purchases = (
            Decimal(str(total_purchases))
            - Decimal(str(total_purchase_returns))
        )

        goods_available = (
            Decimal(str(opening_stock))
            + net_purchases
        )

        cost_of_goods_sold = (
            goods_available
            - Decimal(str(closing_stock))
        )

        gross_profit = (
            net_sales
            - cost_of_goods_sold
        )

        total_revenue = (
            gross_profit
            + Decimal(str(total_service_income))
            + Decimal(str(total_other_income))
        )

        net_profit = (
            total_revenue
            - Decimal(str(total_expenses))
        )
        # print("\n========== INCOME STATEMENT CALCULATION ==========")
        # print("Total Sales:", total_sales)
        # print("Total Sales Returns:", total_sales_returns)
        # print("Net Sales:", net_sales)

        # print("\nTotal Purchases:", total_purchases)
        # print("Total Purchase Returns:", total_purchase_returns)
        # print("Net Purchases:", net_purchases)

        # print("\nOpening Stock:", opening_stock)
        # print("Net Purchases:", net_purchases)
        # print("Goods Available for Sale:", goods_available)

        # print("\nClosing Stock:", closing_stock)
        # print("Cost of Goods Sold:", cost_of_goods_sold)

        # print("\nNet Sales:", net_sales)
        # print("Cost of Goods Sold:", cost_of_goods_sold)
        # print("Gross Profit:", gross_profit)

        # print("\nService Income:", total_service_income)
        # print("Other Income:", total_other_income)
        # print("Total Revenue:", total_revenue)

        # print("\nTotal Expenses:", total_expenses)
        # print("Net Profit:", net_profit)

        # print("==================================================\n")

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
            "total_revenue": total_revenue,

            "expenses": {
                "categories": dict(expenses),
                "total": total_expenses,
            },

            "net_profit": net_profit,
        }
    