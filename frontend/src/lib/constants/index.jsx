import { FaBox, FaShoppingCart, FaFileInvoiceDollar, FaBook, FaClipboardList, FaChartPie, FaUsers, FaTruck } from 'react-icons/fa';
import { IoMdSettings, IoMdHelp  } from "react-icons/io";
import { MdWork } from 'react-icons/md';



export const debitCredit = [
    { name: "Debit", id: 'debit' },
    { name: "Credit", id: 'credit' },
]
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
    {
        name: "Partially Paid",
        value: "partially_paid"
    }
    
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
            url: 'stocks'
        }
    ]
  },
  {
    name: "Purchases",
    icon: <FaShoppingCart className='text-xl'/>,
    lists: [
        {
            name: 'Record purchase',
            url: 'purchases/record'
        },
        {
            name: 'Purchase bill',
            url: 'purchases/bill'
        },
        {
            name: 'View purchases',
            url: 'purchases'
        },
        {
            name: 'View purchase returns',
            url: 'purchase_returns'
        }
    ]
  },
  {
    name: "Sales",
    icon: <FaFileInvoiceDollar className='text-xl'/>,
    lists: [
        {
            name: 'Record sale',
            url: 'sales/record'
        },
        {
            name: 'Sales invoice',
            url: 'sales/invoice'
        },
        {
            name: 'View sales',
            url: 'sales'
        },
        {
            name: 'View sales returns',
            url: 'sales_returns'
        }
    ]
  },
  {
    name: "Journals",
    icon: <FaBook className='text-xl'/>,
    lists: [
        {
            name: 'Record journal',
            url: 'journals/record'
        },
        {
            name: 'View journals',
            url: 'journals'
        }
    ]
  },
  {
    name: "Services",
    icon: <MdWork className='text-xl'/>,
    lists: [
        {
            name: 'Add Service',
            url: null
        },
        {
            name: 'Record Services Income',
            url: 'service_income/record'
        },
        {
            name: 'Services Income Invoice',
            url: 'service_income/invoice'
        },
        {
            name: 'View Services Provided',
            url: 'services'
        },
        {
            name: 'View Services Income',
            url: 'service_income'
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
            url: 'accounts'
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
            url: 'customers'
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
            url: 'suppliers'
        }
    ]
  },

  {
    name: "Reports",
    icon: <FaChartPie className='text-xl'/>,
    lists: [
        {
            name: 'Trial Balance',
            url: 'reports/trialbalance'
        },
        {
            name: 'Income Statement',
            url: 'reports/incomestatment'
        },
        {
            name: 'Balance Sheet',
            url: 'reports/balancesheet'
        }
    ]
  }
];

export const sidebarIconsBottom = [
    {
        name: "Settings",
        icon: <IoMdSettings className='text-xl'/>,
        url: "settings"
    },
    {
        name: "Help and Support",
        icon: <IoMdHelp className='text-xl'/>,
        url: 'helpandsuppot'
    }
]
