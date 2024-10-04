import { FaBox, FaShoppingCart, FaFileInvoiceDollar, FaBook, FaClipboardList, FaChartPie, FaUsers, FaTruck } from 'react-icons/fa';
import { IoMdSettings, IoMdHelp  } from "react-icons/io";


export const dueDaysOptions = [
    {
        name: "All", 
        value: "all"
    },
    {
        name: "In two days",
        value: "in_two"
    },
    {
        name: "3 to 7 days",
        value: "three_to_seven"
    }, {
        name: "8 to 30 days",
        value: "eight_to_thirty"
    },
    {
        name: "More than 30 days",
        value: "than_thirty"
    },
    {
        name: "Overdue",
        value: "overdue"
    }
]
export const statusOptions = [
    {
        name: "All", 
        value: "all"
    },
    {
        name: "Paid",
        value: "paid"
    },
    {
        name: "Unpaid",
        value: "unpaid"
    },
    
]
export const sortOptions = [
    {
        name: 'Reset',
        value: 'reset'
    },
    {
        name: "Newest Date",
        value: "newest"
    },
    {
        name: "Oldest Date",
        value: "oldest"
    },
   
]
export const dateOptions = [
    {
        name: 'All',
        value: 'all'
    },
    {
        name: 'Today',
        value: "today",
    },
    {
        name: "Yesterday",
        value: "yesterday"
    },
    {
        name: "This Week",
        value: "this_week"
    },
    {
        name: "This Month",
        value: "this_month"
    },
    {
        name: "Custom Range",
        value: '*',
    }
]
export const accountGroups = [
{
    name: 'Asset',
    value: 'asset'
},
{
    name: 'Liability',
    value: 'liability'
},
{
    name: 'Capital', 
    value: 'capital'
},
{
    name: 'Expense',
    value: 'expense'
},
{
    name: 'Income',
    value: 'income'
}
];
export const accountCategories = {
    asset: [
      {
        name: 'Current Asset',
        value: 'current_asset'
      },
      {
        name: 'Non-current Asset',
        value: 'non_current_asset'
      }
    ],
    liability: [
      {
        name: 'Current Liability',
        value: 'current_liability'
      },
      {
        name: 'Long-Term Liability',
        value: 'long_term_liability'
      }
    ],
    capital: [
      {
        name: 'Other Equity',
        value: 'other_equity'
      },
      {
        name: 'Owner Equity',
        value: 'owner_equity'
      }
    ],
    expense: [
      {value: "operating_expenses", name: "Operatings Expense"},
      {value: "cost_of_goods_sold", name: "Cost of Goods Sold"},
     
    ],
    income: [
      {value: "sales_revenue", name: "Sales Revenue"},
      {value: "other_income", name: "Other Income"}
    ]
  }

export const accountSubCategories = {
    current_asset: [
        {
            name: 'Cash and Cash Equivalents',
            value: 'cash_and_cash_equivalents'
        },
        {
            name: 'Accounts Receivable',
            value: 'accounts_receivable'
        },
        {
            name: 'Inventory',
            value: 'inventory'
        }
    ],
    non_current_asset: [
        {
            name: 'Property, Plant, and Equipment',
            value: 'property_plant_equipment'
        },
        {
            name: 'Intangible Assets',
            value: 'intangible_assets'
        }
    ],
    current_liability: [
        {
            name: 'Accounts Payable',
            value: 'accounts_payable'
        },
        {
            name: 'Short-term Loans',
            value: 'short_term_loans'
        }
    ],
    long_term_liability: [
        {
            name: 'Long-term Loans',
            value: 'long_term_loans'
        },
        {
            name: 'Mortgage Payable',
            value: 'mortgage_payable'
        }
    ],
    owner_equity: [
        {
            name: 'Retained Earnings',
            value: 'retained_earnings'
        },
        {
            name: 'Owner Investment',
            value: 'owner_investment'
        },
        {
            name: 'Additional Contributions',
            value: 'additional_contributions'
        },
        {
            name: 'Drawings',
            value: 'drawings'
        }
    ],
    other_equity: [
        {
            name: 'Equity from Loans',
            value: 'equity_from_loans'
        },
        {
            name: 'Subordinated Debt',
            value: 'subordinated_debt'
        }
    ],
    operating_expenses: [
        {
            name: 'Rent and Utilities',
            value: 'rent_and_utilities'
        },
        {
            name: 'Salaries and Wages',
            value: 'salaries_and_wages'
        },
        {
            name: 'Marketing and Advertising',
            value: 'marketing_and_advertising'
        }
    ],
    cost_of_goods_sold: [
      {
            name: 'Cost of Goods Sold',
            value: 'cost_of_goods_sold'
        },
       
    ],
    sales_revenue: [
        {
            name: 'Product Sales',
            value: 'product_sales'
        },
        {
            name: 'Service Revenue',
            value: 'service_revenue'
        }
    ],
    other_income: [
        {
            name: 'Interest Income',
            value: 'interest_income'
        },
        {
            name: 'Investment Income',
            value: 'investment_income'
        }
    ]
};


export const sidebarIcons = [
  {
    name: "Stocks",
    icon: <FaBox className='text-xl'/>,
    lists: [
        {
            name: 'Add stock item',
            url: null
        },
        {
            name: 'View stocks',
            url: '/stocks'
        }
    ]
  },
  {
    name: "Purchases",
    icon: <FaShoppingCart className='text-xl'/>,
    lists: [
        {
            name: 'Record purchase',
            url: '/purchases/record'
        },
        {
            name: 'Purchase bill',
            url: '/purchases/bill'
        },
        {
            name: 'View purchases',
            url: '/purchases'
        },
        {
            name: 'View purchase returns',
            url: '/purchase_returns'
        }
    ]
  },
  {
    name: "Sales",
    icon: <FaFileInvoiceDollar className='text-xl'/>,
    lists: [
        {
            name: 'Record sale',
            url: '/sales/record'
        },
        {
            name: 'Sales invoice',
            url: '/sales/invoice'
        },
        {
            name: 'View sales',
            url: '/sales'
        },
        {
            name: 'View sales returns',
            url: '/sales_returns'
        }
    ]
  },
  {
    name: "Journals",
    icon: <FaBook className='text-xl'/>,
    lists: [
        {
            name: 'Record journal',
            url: '/journals/record'
        },
        {
            name: 'Journal invoice',
            url: '/journals/invoice',
        },
        {
            name: 'Journal bill',
            url: '/journals/bill'
        },
        {
            name: 'View journals',
            url: '/journals'
        }
    ]
  },
  {
    name: "Accounts",
    icon: <FaClipboardList className='text-xl'/>,
    lists: [
        {
            name: 'Add account',
            url: null
        },
        {
            name: 'Chart of Accounts',
            url: '/accounts'
        }
    ]
  },
  {
    name: "Customers",
    icon: <FaUsers className='text-xl'/>,
    lists: [
        {
            name: 'Add customer',
            url: null
        },
        {
            name: 'View customers',
            url: '/customers'
        }
    ]
  },

  {
    name: "Suppliers",
    icon: <FaTruck className='text-xl'/>,
    lists: [
        {
            name: 'Add supplier',
            url: null
        },
        {
            name: 'View suppliers',
            url: '/suppliers'
        }
    ]
  },

  {
    name: "Reports",
    icon: <FaChartPie className='text-xl'/>,
    lists: [
        {
            name: 'Trial Balance',
            url: '/reports/trialbalance'
        },
        {
            name: 'Income Statement',
            url: '/reports/incomestatment'
        },
        {
            name: 'Balance Sheet',
            url: '/reports/balancesheet'
        }
    ]
  }
];

export const sidebarIconsBottom = [
    {
        name: "Settings",
        icon: <IoMdSettings className='text-xl'/>,
        url: "/settings"
    },
    {
        name: "Help and Support",
        icon: <IoMdHelp className='text-xl'/>,
        url: '/helpandsuppot'
    }
]
