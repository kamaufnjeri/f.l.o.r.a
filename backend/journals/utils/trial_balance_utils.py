from .account_utils import AccountUtils


class TrialBalanceUtils:
    """
    Builds a hierarchical Trial Balance.

    Fixed Group
        └── Category
              └── Sub Category
                    └── Account
    """

    def __init__(self, queryset, period=None):
        self.queryset = queryset
        self.period = period

    def create_node(self, id, name, children_key):
        """
        Creates a node for:
        - Fixed Group
        - Category
        - Sub Category

        Debit and credit are accumulated internally.
        They are converted to amount/balance_type before
        returning the response.
        """
        return {
            "id": id,
            "name": name,

            # Internal totals
            "debit": 0,
            "credit": 0,

            # Final values returned to frontend
            "amount": 0,
            "balance_type": None,

            children_key: {}
        }

    def calculate_balance(self, node):
        """
        Converts accumulated debit/credit totals into
        the frontend format.

        Example:

        debit = 5000
        credit = 3000

        becomes

        amount = 2000
        balance_type = debit
        """

        debit = node.pop("debit")
        credit = node.pop("credit")

        if debit >= credit:
            node["amount"] = debit - credit
            node["balance_type"] = "debit"
        else:
            node["amount"] = credit - debit
            node["balance_type"] = "credit"

        return node
    def get_balance(self, account):
        """
        Returns the account balance in Trial Balance format.

        Example:
            {
                "amount": 500,
                "balance_type": "debit",
                "debit": 500,
                "credit": 0
            }

        The debit/credit values are used internally for
        accumulating category, sub-category and fixed group
        totals. The frontend only needs amount and
        balance_type.
        """

        util = AccountUtils(account, self.period)

        balance = util.get_account_balance()

        amount = balance["amount"]
        balance_type = balance["balance_type"]

        return {
            "amount": amount,
            "balance_type": balance_type,
            "debit": amount if balance_type == "debit" else 0,
            "credit": amount if balance_type == "credit" else 0,
        }
    
    def add_balance(self, node, balance):
        """
        Adds an account balance into a Fixed Group,
        Category or Sub Category.

        Example:

            Cash (Dr 500)

        becomes

            node["debit"] += 500

        Example:

            Loan (Cr 300)

        becomes

            node["credit"] += 300
        """

        node["debit"] += balance["debit"]
        node["credit"] += balance["credit"]

    def get_trial_balance(self):
        """
        Builds the Trial Balance hierarchy.

        Fixed Group
            └── Category
                └── Sub Category
                        └── Account
        """

        fixed_groups = {}

        total_debit = 0
        total_credit = 0

        accounts = self.queryset.select_related(
            "belongs_to",
            "belongs_to__category",
            "belongs_to__category__group",
        ).order_by(
            "belongs_to__category__group__name",
            "belongs_to__category__name",
            "belongs_to__name",
            "name",
        )

        for account in accounts:

            balance = self.get_balance(account)

            # Ignore zero balance accounts
            if balance["amount"] == 0:
                continue

            sub_category = account.belongs_to
            category = sub_category.category
            fixed_group = category.group

            # ----------------------------
            # Fixed Group
            # ----------------------------
            if fixed_group.id not in fixed_groups:
                fixed_groups[fixed_group.id] = self.create_node(
                    fixed_group.id,
                    fixed_group.name,
                    "categories",
                )

            fg = fixed_groups[fixed_group.id]

            # ----------------------------
            # Category
            # ----------------------------
            if category.id not in fg["categories"]:
                fg["categories"][category.id] = self.create_node(
                    category.id,
                    category.name,
                    "sub_categories",
                )

            cat = fg["categories"][category.id]

            # ----------------------------
            # Sub Category
            # ----------------------------
            if sub_category.id not in cat["sub_categories"]:
                node = self.create_node(
                    sub_category.id,
                    sub_category.name,
                    "accounts",
                )

                node["accounts"] = []

                cat["sub_categories"][sub_category.id] = node

            sub = cat["sub_categories"][sub_category.id]

            # ----------------------------
            # Account
            # ----------------------------
            sub["accounts"].append({
                "id": account.id,
                "name": account.name,
                "amount": balance["amount"],
                "balance_type": balance["balance_type"],
            })

            # ----------------------------
            # Roll totals upwards
            # ----------------------------
            self.add_balance(sub, balance)
            self.add_balance(cat, balance)
            self.add_balance(fg, balance)

            total_debit += balance["debit"]
            total_credit += balance["credit"]

        # ---------------------------------
        # Convert dictionaries into lists
        # ---------------------------------

        result = []

        for fg in fixed_groups.values():

            categories = []

            for cat in fg["categories"].values():

                sub_categories = []

                for sub in cat["sub_categories"].values():

                    self.calculate_balance(sub)

                    sub_categories.append(sub)

                cat["sub_categories"] = sub_categories

                self.calculate_balance(cat)

                categories.append(cat)

            fg["categories"] = categories

            self.calculate_balance(fg)

            result.append(fg)

        return {
            "fixed_groups": result,
            "totals": {
                "debit": total_debit,
                "credit": total_credit,
            },
        }