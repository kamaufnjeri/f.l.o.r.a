import { SidebarItemType } from "@/constants";

export interface RegisterData {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    confirm_password: string;
}

export type AnyObject = Record<string, unknown>;

export interface RequestResult<T = unknown> {
  success: boolean;
  error?: string | null;
  data?: T;
  message?: string;
  redirectTo?: string;
};

export type ApiErrorData = {
  details?: unknown;
  [key: string]: unknown;
};

export interface ApiErrorShape {
  response?: {
    data?:  ApiErrorData;
  };
  message?: string;
};

export type Organisation = {
  id: string;
  org_name: string;
  org_email?: string;
  org_phone_number?: string;
  country?: string;
  currency?: string;
};

export type UserOrganisation = {
  org_id: string;
  org_name: string;
};

export type User = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  user_organisations?: UserOrganisation[];
  current_organisation?: Organisation | null;
};

export interface SidebarContentProps {
  sidebarIcons: SidebarItemType[];
  pathname: string;
  isCollapsed: boolean;
  activeDropdown: string | null;
  setActiveDropdown: (value: string | null | ((prev: string | null) => string | null)) => void;
  currentOrg: Organisation;
}

export interface SidebarShellProps {
  children: React.ReactNode;
  isMobileOpen: boolean;
  isCollapsed: boolean;
  setIsMobileOpen: (v: boolean) => void;
  setIsCollapsed: (v: boolean) => void;
  currentOrg: Organisation;
  user: User;
  handleLogout: () => void;
  isLoggingOut: boolean;
}

// lib/types/journal.ts
export type DebitCredit = "debit" | "credit";

export type JournalType =
  | "journal"
  | "purchase"
  | "sales"
  | "bill"
  | "invoice"
  | "discount"
  | "service_income"
  | "payment";


export interface JournalEntry {
  account: string | "";
  debit_credit: DebitCredit;
  amount: number;
  type: JournalType;
}

export interface JournalFormData {
  date: string;
  description: string;
  serial_number: string;
  journal_entries: JournalEntry[];
}

export type ID = string;

export interface Account {
  id: ID;
  name: string;
  sub_category: string;
}

export interface Customer {
  id: ID;
  name: string;
}

export interface Supplier {
  id: ID;
  name: string;
}

export interface Stock {
  id: ID;
  name: string;
}

export interface Service {
  id: ID;
  name: string;
}

export interface Category {
  id: ID;
  name: string;
}

export interface SubCategory {
  id: ID;
  name: string;
}

export interface SerialNumbers {
  journal: string;
  sales: string;
  service_income: string;
  purchase: string;
}

export interface FixedGroup {
  id: string;
  name: string;
}

export interface SelectOptions {
  accounts: Account[];

  suppliersAccounts: Account[];
  customersAccounts: Account[];

  paymentAccounts: Account[];
  purchaseAccounts: Account[];
  salesAccounts: Account[];
  serviceIncomeAccounts: Account[];

  incomeDiscountAccounts: Account[];
  expenseDiscountAccounts: Account[];

  stocks: Stock[];

  serial_numbers: SerialNumbers;

  fixed_groups: FixedGroup[];
  categories: Category[];
  sub_categories: SubCategory[];
  services: Service[];
}

export interface ResJournalEntry extends JournalEntry {
  account_name: string;
  id: string;
}

export interface JournalTotals {
  debit_total: number;
  credit_total: number;
}

export interface Journal {
  id: string;
  serial_number: string;
  date: string;
  description: string;

  journal_entries: JournalEntry[];

  journal_entries_total?: JournalTotals;
}



export interface PurchaseEntry {
  stock: string | number | null;
  purchased_quantity: number;
  purchase_price: number;
}


export interface PurchaseFormData {
  date: string;
  description: string;
  due_date: string;
  serial_number: string;
  purchase_entries: PurchaseEntry[];
  journal_entries: JournalEntry[];
}


export interface Purchase {
  id: string;
  date: string;
  description: string;
  due_date: string | null;
  serial_number: string;
  purchase_entries: PurchaseEntry[];
  journal_entries: JournalEntry[];
  journal_entries_total?: JournalTotals;

}


export interface StockForm {
  name: string;
  unit_name: string;
  unit_alias: string;

  opening_stock_quantity: number;
  opening_stock_rate: number;
}

export interface SaleEntry {
  stock: string | number | null;
  sold_quantity: number;
  sales_price: number;
}


export interface SaleFormData {
  date: string;
  description: string;
  due_date: string;
  serial_number: string;
  sales_entries: SaleEntry[];
  journal_entries: JournalEntry[];
}


export interface Sale {
  id: string;
  date: string;
  description: string;
  due_date: string | null;
  serial_number: string;
  sales_entries: SaleEntry[];
  journal_entries: JournalEntry[];
  journal_entries_total?: JournalTotals;

}

export type ServiceFormData = {
  name: string;
  description: string;
};


export interface ServiceIncomeEntry {
  service: string | null;
  quantity: number;
  price: number;
}


export interface ServiceIncomeFormData {
  date: string;
  description: string;
  due_date: string;
  serial_number: string;
  service_income_entries: ServiceIncomeEntry[];
  journal_entries: JournalEntry[];
}


export interface ServiceIncome {
  id: string;
  date: string;
  description: string;
  due_date: string | null;
  serial_number: string;
  service_income_entries: ServiceIncomeEntry[];
  journal_entries: JournalEntry[];
  journal_entries_total?: JournalTotals;
}


export type SupplierCustomerFormData = {
  name: string;
  email: string;
  phone_number: string;
};


export type ModalName = "account" | "stock" | "service" | "customer" | "supplier";

export type OptionItem = {
  id: string | number;
  label: string;
  value?: unknown;
};

export type UISection = {
  key: string;
  label: string;
  modal?: ModalName;
  showAdd?: boolean;
  items: OptionItem[];
};