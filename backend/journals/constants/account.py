ACCOUNT_STRUCTURE = {
    "asset": {
        "current_asset": [
            "cash_and_cash_equivalents",
            "accounts_receivable",
            "inventory"
        ],
        "non_current_asset": [
            "property_plant_equipment",
            "intangible_assets"
        ]
    },
    "liability": {
        "current_liability": [
            "accounts_payable",
            "short_term_loans"
        ],
        "long_term_liability": [
            "long_term_loans",
            "mortgage_payable"
        ]
    },
    "capital": {
        "owner_equity": [
            "retained_earnings",
            "owner_investment",
            "drawings", 
            "additional_contributions"
        ],
        "other_equity": [
            "equity_from_loans",
            "subordinated_debt"
        ]
    },
    "expense": {
        "operating_expense": [
            "rent_and_utilities",
            "salaries_and_wages",
            "selling_expense",
            "cost_of_goods_sold",
            "marketing_and_advertising",
            "contra-expense",
            "expense_from_discounts"
        ],
        "other_expense": [
            "interent_expense"
        ]
        
    },
    "income": {
        "operating_income": [
            "product_sales",
            "service_revenue",
            "contra-revenue"
        ],
        "other_income": [
            "interest_income",
            "investment_income",
            "income_from_discounts"
        ]
    }
}
GROUPS = (
        ("asset", "Asset"),
        ("liability", "Liability"),
        ("capital", "Capital"),
        ("expense", "Expense"),
        ("income", "Income")
    )

CATEGORIES = (
        ("current_asset", "Current Asset"),
        ("non_current_asset", "Non-current Asset"),
        ("current_liability", "Current Liability"),
        ("long_term_liability", "Long-term Liability"),
        ("owner_equity", "Owner Equity"),
        ("other_equity", "Other Equity"),
        ("operating_expense", "Operating Expense"),
        ("other_expense", "Other Expense"),
        ("operating_income", "Operating Income"),
        ("other_income", "Other Income")
    )

SUB_CATEGORIES = (
        ("cash_and_cash_equivalents", "Cash and Cash Equivalents"),
        ("accounts_receivable", "Accounts Receivable"),
        ("inventory", "Inventory"),
        ("property_plant_equipment", "Property, Plant, and Equipment"),
        ("intangible_assets", "Intangible Assets"),
        ("accounts_payable", "Accounts Payable"),
        ("short_term_loans", "Short-term Loans"),
        ("long_term_loans", "Long-term Loans"),
        ("mortgage_payable", "Mortgage Payable"),
        ("retained_earnings", "Retained Earnings"),
        ("owner_investment", "Owner Investment"),
        ("additional_contributions", "Additional Contributions"),
        ("drawings", "Drawings"),
        ("equity_from_loans", "Equity from Loans"),
        ("subordinated_debt", "Subordinated Debt"),
        ("rent_and_utilities", "Rent and Utilities"),
        ("salaries_and_wages", "Salaries and Wages"),
        ("marketing_and_advertising", "Marketing and Advertising"),
        ("cost_of_goods_sold", "Cost of Goods Sold"),
        ("expense_from_discounts", "Expense from Discounts"),
        ("contra-revenue", "Contra-Revenue"),
        ("contra-expense", "Contra-Expense"),
        ("selling_expense", "Selling Expense"),
        ("interent_expense", "Interest Expense"),
        ("product_sales", "Product Sales"),
        ("service_revenue", "Service Revenue"),
        ("interest_income", "Interest Income"),
        ("investment_income", "Investment Income"),
        ("income_from_discounts", "Income from Discounts")
    )