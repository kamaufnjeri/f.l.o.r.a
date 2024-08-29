import { FaBox, FaShoppingCart, FaFileInvoiceDollar, FaBook, FaClipboardList, FaChartPie, FaUsers, FaTruck } from 'react-icons/fa';
import { IoMdSettings, IoMdHelp  } from "react-icons/io";


export const accountCategories = [
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
export const accountSubCategories = {
    asset: [
      {
        name: 'Current Asset',
        value: 'current_asset'
      },
      {
        name: 'Non-current Asset',
        value: 'non-current_asset'
      }
    ],
    liability: [
      {
        name: 'Current Liability',
        value: 'current_liability'
      },
      {
        name: 'Long-Term Loan',
        value: 'long-term_loan'
      }
    ],
    capital: [
      {
        name: 'Capital',
        value: 'capital'
      }
    ],
    expense: [
      {value: "indirect_expense", name: "Indirect Expense"},
      {value: "cost_of_goods_sold", name: "Cost of Goods Sold"},
     
    ],
    income: [
      {value: "sales_revenue", name: "Sales Revenue"},
      {value: "indirect_income", name: "Indirect Income"}
    ]
  }


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
            url: '/journal/bill'
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
