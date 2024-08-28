import { FaBox, FaShoppingCart, FaFileInvoiceDollar, FaBook, FaClipboardList, FaChartPie, FaUsers, FaTruck } from 'react-icons/fa';
import { IoMdSettings, IoMdHelp  } from "react-icons/io";


export const sidebarIcons = [
  {
    name: "Stocks",
    icon: <FaBox className='text-xl'/>,
    lists: [
        {
            name: 'Add stock Item',
            url: '/stocks/add'
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
            url: '/accounts/add'
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
            url: '/customers/add'
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
            url: '/suppliers/add'
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
