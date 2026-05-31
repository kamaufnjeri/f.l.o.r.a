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
import { IoMdSettings, IoMdHelp } from "react-icons/io";
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
  url: string;
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
    url: "/dashboard",
    lists: null,
  },

  {
    name: "Purchases",
    icon: FaShoppingCart,
    url: null,
    lists: [
      { name: "Record Purchase", url: "/dashboard/purchases/record" },
      { name: "All Purchases", url: "/dashboard/purchases" },
      { name: "Purchase Returns", url: "/dashboard/purchases/returns" },
    ],
  },

  {
    name: "Sales",
    icon: FaFileInvoiceDollar,
    url: null,
    lists: [
      { name: "Record Sale", url: "/dashboard/sales/record" },
      { name: "All Sales", url: "/dashboard/sales" },
      { name: "Sales Returns", url: "/dashboard/sales/returns" },
    ],
  },

  {
    name: "Journals",
    icon: FaBook,
    url: null,
    lists: [
      { name: "Record Journal", url: "/dashboard/journals/record" },
      { name: "All Journals", url: "/dashboard/journals" },
    ],
  },

  {
    name: "Services",
    icon: MdWork,
    url: null,
    lists: [
      { name: "Record Service Income", url: "/dashboard/services/record" },
      { name: "All Services", url: "/dashboard/services" },
      { name: "All Services Income", url: "/dashboard/services/income" },
    ],
  },

  {
    name: "Accounts",
    icon: FaClipboardList,
    url: "/dashboard/accounts",
    lists: null,
  },

  {
    name: "Stocks",
    icon: FaBox,
    url: "/dashboard/stocks",
    lists: null,
  },

  {
    name: "Customers",
    icon: FaUsers,
    url: "/dashboard/customers",
    lists: null,
  },

  {
    name: "Suppliers",
    icon: FaTruck,
    url: "/dashboard/suppliers",
    lists: null,
  },

  {
    name: "Others",
    icon: FaTh,
    url: null,
    lists: [
      { name: "Bills", url: "/dashboard/bills" },
      { name: "Invoices", url: "/dashboard/invoices" },
      { name: "Payments", url: "/dashboard/payments" },
    ],
  },

  {
    name: "Reports",
    icon: FaChartPie,
    url: null,
    lists: [
      { name: "Trial Balance", url: "/dashboard/reports/trial-balance" },
      { name: "Income Statement", url: "/dashboard/reports/income-statement" },
      { name: "Balance Sheet", url: "/dashboard/reports/balance-sheet" },
    ],
  },

  {
    name: "Settings",
    icon: IoMdSettings,
    url: "/dashboard/settings",
    lists: null,
  },

  {
    name: "Help & Support",
    icon: MdHelp,
    url: "/dashboard/help",
    lists: null,
  },
];