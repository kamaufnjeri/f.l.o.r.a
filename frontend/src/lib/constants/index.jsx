import { FaBox, FaShoppingCart, FaFileInvoiceDollar, FaBook, FaClipboardList, FaChartPie, FaUsers, FaTruck, FaTh } from 'react-icons/fa';
import { IoMdSettings, IoMdHelp } from "react-icons/io";
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
        name: "Purchases",
        icon: <FaShoppingCart className='text-xl' />,
        url: null,
        lists: [
            {
                name: 'Record purchase',
                url: 'purchases/record'
            },
            {
                name: 'Purchases',
                url: 'purchases'
            },
            {
                name: 'Purchase returns',
                url: 'purchase_returns'
            }
        ]
    },
    {
        name: "Sales",
        icon: <FaFileInvoiceDollar className='text-xl' />,
        url: null,
        lists: [
            {
                name: 'Record sale',
                url: 'sales/record'
            },
            {
                name: 'Sales',
                url: 'sales'
            },
            {
                name: 'Sales returns',
                url: 'sales_returns'
            }
        ]
    },
    {
        name: "Journals",
        icon: <FaBook className='text-xl' />,
        url: null,
        lists: [
            {
                name: 'Record journal',
                url: 'journals/record'
            },
            {
                name: 'Journals',
                url: 'journals'
            }
        ]
    },
    {
        name: "Services",
        icon: <MdWork className='text-xl' />,
        url: null,
        lists: [
            
            {
                name: 'Record service income',
                url: 'service_income/record'
            },
            {
                name: 'Services',
                url: 'Services'
            },
            {
                name: 'Services income',
                url: 'service_income'
            }
        ]
    },
    {
        name: "Accounts",
        icon: <FaClipboardList className='text-xl' />,
        lists: null,

       url: 'accounts'
    },
    {
        name: "Stocks",
        icon: <FaBox className='text-xl' />,
        lists: null,
        url: 'stocks'
    },
    {
        name: "Customers",
        icon: <FaUsers className='text-xl' />,
        lists: null,
        url: 'customers'
       
    },

    {
        name: "Suppliers",
        icon: <FaTruck className='text-xl' />,
        lists: null,
        url: 'suppliers'
    },

    {
        name: "Reports",
        icon: <FaChartPie className='text-xl' />,
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
    },
    {
        name: "Others",
        icon: <FaTh className='text-xl' />,
        lists: [
            {
                name: 'Bills',
                url: 'bills'
            },
            {
                name: 'Invoices',
                url: 'invoices'
            },
            {
                name: 'Payment',
                url: 'payments'
            }
        ]
    }
];

export const sidebarIconsBottom = [
    {
        name: "Settings",
        icon: <IoMdSettings className='text-xl' />,
        url: "settings"
    },
    {
        name: "Help and Support",
        icon: <IoMdHelp className='text-xl' />,
        url: 'helpandsuppot'
    }
]
