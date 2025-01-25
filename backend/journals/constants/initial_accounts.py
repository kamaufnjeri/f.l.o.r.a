INITIAL_DATA = [
    {
        "category": {"name": "Current Asset", "group": "Asset"},
        "sub_categories": [
            {
                "name": "Cash and Cash Equivalents",
                "accounts": [
                    {"name": "Cash"},
                    {"name": "Bank"}
                ]
            },
            {
                "name": "Accounts Receivable",
                "accounts": []
            }
        ]
    },
    {
        "category": {"name": "Current Liability", "group": "Liability"},
        "sub_categories": [
            {
                "name": "Accounts Payable",
                "accounts": []
            }
        ]
    },
    {
        "category": {"name": "Owner Equity", "group": "Capital"},
        "sub_categories": [
            {
                "name": "Owner Investment",
                "accounts": [
                    {"name": "Capital"}
                ]
            }
        ]
    },
    {
        "category": {"name": "Operating Expense", "group": "Expense"},
        "sub_categories": [
            {
                "name": "Cost of Goods Sold",
                "accounts": [
                    {"name": "Purchase"}
                ]
            },
            {
                "name": "Expense from Discounts",
                "accounts": [
                    {"name": "Discount Allowed"}
                ]
            },
            {
                "name": "Contra-Expense",
                "accounts": [
                    {"name": "Purchase Return"}
                ]
            }
        ]
    },
    {
        "category": {"name": "Operating Income", "group": "Income"},
        "sub_categories": [
            {
                "name": "Product Sales",
                "accounts": [
                    {"name": "Sales"}
                ]
            },
            {
                "name": "Contra-Revenue",
                "accounts": [
                    {"name": "Sales Return"}
                ]
            },
            {
                "name": "Service Income",
               "accounts": [
                   {"name": "Service Income"}
               ]
            }
        ]
    },
    {
        "category": {"name": "Other Income", "group": "Income"},
        "sub_categories": [
            {
                "name": "Income from Discounts",
                "accounts": [
                    {"name": "Discount Received"}
                ]
            }
        ]
    }
]

PERMANENT_ACCOUNTS = ('Cash', 'Bank', 'Capital', 'Purchase', 'Discount Allowed', 'Purchase Return', 'Sales', 'Sales Return', 'Service Income', 'Discount Received')
