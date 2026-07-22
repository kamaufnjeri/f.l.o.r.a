from journals.utils.account_utils import AccountUtils
from journals.utils.income_statement_utils import IncomeStatementUtils
from datetime import datetime, timedelta
from .stock_utils import StockUtils


class BalanceSheetUtils:

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
            'inventory': closing_stock_total - opening_stock_total
        }
    
    def create_node(self, id, name, children_key):
        return {
            "id": id,
            "name": name,
            "debit": 0,
            "credit": 0,
            "amount": 0,
            "balance_type": None,
            children_key: {}
        }

    def calculate_balance(self, node):

        debit = node.pop("debit")
        credit = node.pop("credit")

        if debit >= credit:
            node["amount"] = debit - credit
            node["balance_type"] = "debit"
        else:
            node["amount"] = credit - debit
            node["balance_type"] = "credit"

        return node

    def get_account_balance(self, account):

        util = AccountUtils(account, self.period)

        balance = util.get_account_balance()

        amount = balance["amount"]

        return {
            "amount": amount,
            "balance_type": balance["balance_type"],
            "debit": amount if balance["balance_type"] == "debit" else 0,
            "credit": amount if balance["balance_type"] == "credit" else 0,
        }
    def add_balance(self, node, balance):

        node["debit"] += balance["debit"]
        node["credit"] += balance["credit"]

    def get_balance_sheet(self):

        # -------------------------------------------------------
        # Closing Stock
        # -------------------------------------------------------

        stock_data = self.get_opening_closing_stock()

        closing_stock = stock_data["closing_stock"]
        opening_stock = stock_data['opening_stock']
        inventory = stock_data['inventory']


        # -------------------------------------------------------
        # Containers
        # -------------------------------------------------------

        assets = {
            "current": {},
            "non_current": {},
        }

        liabilities = {
            "current": {},
            "non_current": {},
        }

        capital = {
            "owner_equity": {},
        }

        # -------------------------------------------------------
        # Totals
        # -------------------------------------------------------

        total_current_assets = 0
        total_non_current_assets = 0

        total_current_liabilities = 0
        total_non_current_liabilities = 0

        total_capital = 0

        # Income Statement Totals

        total_sales = 0
        total_sales_returns = 0

        total_purchases = 0
        total_purchase_returns = 0

        total_service_income = 0
        total_other_income = 0
        total_expenses = 0

        # -------------------------------------------------------
        # Accounts
        # -------------------------------------------------------

        accounts = (
            self.accounts
            .select_related(
                "belongs_to",
                "belongs_to__category",
                "belongs_to__category__group",
            )
            .order_by(
                "belongs_to__category__group__name",
                "belongs_to__category__name",
                "belongs_to__name",
                "name",
            )
        )

        for account in accounts:

            balance = self.get_account_balance(account)

            if balance["amount"] == 0:
                continue

            amount = float(balance["amount"])

            group = account.belongs_to.category.group.name
            category = account.belongs_to.category.name
            sub_category = account.belongs_to.name
            account_name = account.name

            # ===================================================
            # Income Statement
            # ===================================================

            if group == "Income":

                if sub_category == "Product Sales":
                    total_sales += amount

                elif account_name == "Sales Return":
                    total_sales_returns += amount

                elif sub_category == "Service Income":
                    total_service_income += amount

                else:
                    total_other_income += amount

                continue

            elif group == "Expense":

                if account_name == "Purchase":
                    total_purchases += amount

                elif account_name == "Purchase Return":
                    total_purchase_returns += amount

                else:
                    total_expenses += amount

                continue

            # ===================================================
            # Balance Sheet
            # ===================================================

            node = {
                "id": account.id,
                "name": account.name,
                "amount": balance["amount"],
                "balance_type": balance["balance_type"],
            }

            if group == "Asset":

                if category == "Current Asset":

                    assets["current"]\
                        .setdefault(sub_category, [])\
                        .append(node)

                    total_current_assets += amount

                else:

                    assets["non_current"]\
                        .setdefault(sub_category, [])\
                        .append(node)

                    total_non_current_assets += amount

            elif group == "Liability":

                if category == "Current Liability":

                    liabilities["current"]\
                        .setdefault(sub_category, [])\
                        .append(node)

                    total_current_liabilities += amount

                else:

                    liabilities["non_current"]\
                        .setdefault(sub_category, [])\
                        .append(node)

                    total_non_current_liabilities += amount

            elif group == "Capital":

                capital["owner_equity"]\
                    .setdefault(sub_category, [])\
                    .append(node)

                total_capital += amount

        # -------------------------------------------------------
        # Net Profit
        # -------------------------------------------------------


        net_sales = total_sales - total_sales_returns

        net_purchases = total_purchases - total_purchase_returns

        goods_available = opening_stock + net_purchases

        cost_of_goods_sold = goods_available - closing_stock

        gross_profit = net_sales - cost_of_goods_sold

        total_revenue = (
            gross_profit
            + total_service_income
            + total_other_income
        )

        net_profit = total_revenue - total_expenses

        # -------------------------------------------------------
        # Closing Stock
        # -------------------------------------------------------

        assets["current"]["Inventory"] = stock_data

        total_current_assets += inventory

        # -------------------------------------------------------
        # Retained Earnings
        # -------------------------------------------------------

        capital["retained_earnings"] = {
            "name": "Current Year Profit",
            "amount": net_profit,
        }

        total_capital += net_profit

        # -------------------------------------------------------
        # Totals
        # -------------------------------------------------------

        total_assets = (
            total_current_assets +
            total_non_current_assets
        )

        total_liabilities = (
            total_current_liabilities +
            total_non_current_liabilities
        )

        return {
            "assets": {
                "current": assets["current"],
                "non_current": assets["non_current"],
                "total_current": total_current_assets,
                "total_non_current": total_non_current_assets,
                "total": total_assets,
            },

            "liabilities": {
                "current": liabilities["current"],
                "non_current": liabilities["non_current"],
                "total_current": total_current_liabilities,
                "total_non_current": total_non_current_liabilities,
                "total": total_liabilities,
            },

            "capital": {
                "owner_equity": capital["owner_equity"],
                "retained_earnings": capital["retained_earnings"],
                "total": total_capital,
            },

            "totals": {
                "assets": total_assets,
                "liabilities": total_liabilities,
                "capital": total_capital,
                "balanced": (
                    total_assets ==
                    total_liabilities + total_capital
                ),
            },
        }