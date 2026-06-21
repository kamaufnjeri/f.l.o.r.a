import React from "react";
import {
  FaBox,
  FaShoppingCart,
  FaFileInvoiceDollar,
  FaBook,
  FaClipboardList,
  FaChartPie,
  FaUsers,
  FaTruck,
  FaTh,
  FaHome,
} from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";
import { MdHelp, MdWork } from "react-icons/md";

/* =========================
   TYPES
========================= */

export type OptionType = {
  name: string;
  value: string;
};

export type DebitCreditType = {
  name: string;
  id: "debit" | "credit";
};

export type SidebarChild = {
  name: string;
  url?: string | null;
  showModal?: boolean;
};

export type SidebarItemType = {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  url: string | null;

  lists: SidebarChild[] | null;
};

/* =========================
   OPTIONS
========================= */

export const debitCredit: DebitCreditType[] = [
  { name: "Debit", id: "debit" },
  { name: "Credit", id: "credit" },
];

export const dueDaysOptions: OptionType[] = [
  { name: "All", value: "all" },
  { name: "In two days", value: "in_two" },
  { name: "3 to 7 days", value: "three_to_seven" },
  { name: "8 to 30 days", value: "eight_to_thirty" },
  { name: "More than 30 days", value: "than_thirty" },
  { name: "Overdue", value: "overdue" },
];

export const statusOptions: OptionType[] = [
  { name: "All", value: "all" },
  { name: "Paid", value: "paid" },
  { name: "Unpaid", value: "unpaid" },
  { name: "Partially Paid", value: "partially_paid" },
];

export const sortOptions: OptionType[] = [
  { name: "Recently Added", value: "newest" },
  { name: "Earliest Added", value: "oldest" },
  { name: "Reset", value: "reset" },
];

export const dateOptions: OptionType[] = [
  { name: "All", value: "all" },
  { name: "Today", value: "today" },
  { name: "Yesterday", value: "yesterday" },
  { name: "This Week", value: "this_week" },
  { name: "This Month", value: "this_month" },
  { name: "Custom Range", value: "*" },
];

export const sidebarIcons = [
  {
    name: "Dashboard",
    icon: FaHome,
    url: "",
    lists: null,
  },

  {
    name: "Purchases",
    icon: FaShoppingCart,
    url: null,
    lists: [
      { name: "Record Purchase", url: "purchases/record" },
      { name: "All Purchases", url: "purchases" },
      { name: "Purchase Returns", url: "purchases/returns" },
    ],
  },

  {
    name: "Sales",
    icon: FaFileInvoiceDollar,
    url: null,
    lists: [
      { name: "Record Sale", url: "sales/record" },
      { name: "All Sales", url: "sales" },
      { name: "Sales Returns", url: "sales/returns" },
    ],
  },

  {
    name: "Journals",
    icon: FaBook,
    url: null,
    lists: [
      { name: "Record Journal", url: "journals/record" },
      { name: "All Journals", url: "journals" },
    ],
  },

  {
    name: "Services",
    icon: MdWork,
    url: null,
    lists: [
      { name: "Record Service Income", url: "service-income/record" },
      { name: "All Services Income", url: "service-income" },
      { name: "All Services", url: "services" },
      { name: "service", showModal: true, url: null },
    ],
  },

  {
    name: "Accounts",
    icon: FaClipboardList,
    url: null,
    lists: [
      { name: "All Accounts", url: "accounts" },
      { name: "account", showModal: true, url: null }
    ],
  },

  {
    name: "Stocks",
    icon: FaBox,
    url: null,
    lists: [
      { name: "All Stocks", url: "stocks" },
      { name: "stock", showModal: true, url: null }
    ],
  },

  {
    name: "Customers",
    icon: FaUsers,
    url: null,
    lists: [
      { name: "All Customers", url: "customers" },
      { name: "customer", showModal: true, url: null }
    ],
  },

  {
    name: "Suppliers",
    icon: FaTruck,
    url: null,
    lists: [
      { name: "All Suppliers", url: "suppliers" },
      { name: "supplier", showModal: true, url: null }
    ],
  },

  {
    name: "Others",
    icon: FaTh,
    url: null,
    lists: [
      { name: "Bills", url: "bills" },
      { name: "Invoices", url: "invoices" },
      { name: "Payments", url: "payments" },
    ],
  },

  {
    name: "Reports",
    icon: FaChartPie,
    url: null,
    lists: [
      { name: "Trial Balance", url: "reports/trial-balance" },
      { name: "Income Statement", url: "reports/income-statement" },
      { name: "Balance Sheet", url: "reports/balance-sheet" },
    ],
  },

  {
    name: "Settings",
    icon: IoMdSettings,
    url: "settings",
    lists: null,
  },

  {
    name: "Help & Support",
    icon: MdHelp,
    url: "help",
    lists: null,
  },
];