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
  id: string | number;
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
  account_name?: string;
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
  group?: string;
}

export interface SubCategory {
  id: ID;
  name: string;
  category?: string;
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

export interface PaymentFormData {
  id?: string;
  date: string;
  description: string;
  bill?: string | null;
  invoice?: string | null;
  journal_entries: JournalEntry[];
}


export interface Payment {
  id: string;
  date: string;
  description: string;
  bill?: string | null;
  invoice?: string | null;
  journal_entries: JournalEntry[];
  journal_entries_total?: JournalTotals;
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


export type ModalName = "account" | "stock" | "service" | "customer" | "supplier" | "accountGroups";

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

export interface AccountItem  {
  id: string;
  name: string;
  group: string;
  category: string;
  sub_category: string;
  account_balance: string | number;
};

export interface AccountDetails extends AccountItem {
  account_data: {
    entries: {
      details: {
        url: string,
        type: string,
        date: string,
        description: string;
        serial_number: string;
      },
      amount: number,
      debit_credit: DebitCredit,
    }[];
    totals: {
      debit: number,
      credit: number,
      closing: {
        debit_credit: DebitCredit,
        amount: number
      }
    }
  }
}

export interface CustomerItem  {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  account_id: string,
};

export interface CustomerData {
  details: {
    url: string,
    type: string,
    date: string,
    description: string;
    serial_number: string;
    due_days: string;
  },
  due_date: string,
  status: DebitCredit,
  amount_paid: number,
  amount_due: number,
}
export interface CustomerDetails extends CustomerItem {
  customer_data: {
    invoices: CustomerData[];
    totals: {
      amount_paid: number,
      amount_due: number,
      
    }
  }
}

export interface SupplierDetails extends CustomerItem {
  supplier_data: {
    bills: CustomerData[];
    totals: {
      amount_paid: number,
      amount_due: number,
      
    }
  }
}


export interface StockItem  {
  id: string;
  name: string;
  unit_name: string;
  unit_alias: string;
};

export interface StockSummary {
  entries: {
    details: {
      serial_number: string;
      url: string,
      type: string,
      date: string,
      description: string;
      rate: string | number;
      quantity: string | number;
      total: string | number;
    }
  }[],
  totals: {
    name: string;
    quantity: string | number;
    amount: string | number;
  }[]
}
export interface StockDetails extends StockItem {
  stock_summary: StockSummary
}

export interface ServiceItem  {
  id: string;
  name: string;
  description: string;
};

export interface ServiceData {
  entries: {
    price: string | number;
    quantity: string | number;
    details: {
      serial_number: string;
      url: string,
      date: string,
      description: string;
    
      total: string | number;
    }
  }[],
  total: string | number;
}
export interface ServiceDetails extends ServiceItem {
  service_data: ServiceData
}

export interface SalesItem {
  id: string;
  serial_number: string;
  date: string;
  description: string;
}

export interface SalesDetails {
  total_amount: string | number;
  total_quantity: string | number;
  amount_due: string | number;
  type: 'sales' | 'invoice' | 'bill' | 'purchase' | 'service_income';
  items: string[]
}

export interface SalesTotal {
  amount: string | number;
  amount_due: string | number;
  quantity: string | number;
}
export interface SalesOverview extends SalesItem {
  details: SalesDetails
}

export type SalesType = "all" | 'is_invoices' | 'is_not_invoices' | "";
export type PurchaseType = "all" | 'is_bills' | 'is_not_bills' | "";

export type DueDaysType =
  | "all"
  | "in_two"
  | "three_to_seven"
  | "eight_to_thirty"
  | "than_thirty"
  | "overdue"
  | "";

export type StatusType =
  | "all"
  | "paid"
  | "unpaid"
  | "partially_paid"
  | "";
  
export interface BillInvoiceDetails {
  date: string;
  due_days: string;
  type: string;
  serial_number: string;
  url: string;
}

export interface BillInvoice {
  id: string;
  due_date: string;
  amount_paid: string | number;
  amount_due: string | number;
  status: StatusType;
  details: BillInvoiceDetails
}


export interface BillOverview extends BillInvoice {
  supplier_name: string;

}

export interface InvoiceOverview extends BillInvoice {
  customer_name?: string;

}

export interface BillInvoiceTotals {
  amount_paid: string | number;
  amount_due: string | number;
}

export type paymentType = "is_invoices" | "is_bills" | "all" | "";
export interface PaymentOverview {
  id: string;
  date: string;
  description: string;
  amount_paid: string | number;
  details: { 
    type: string;
    serial_number: string;
    url: string;
  }
}

export interface PaymentTotals {
  amount_paid: string | number;
}

export interface ReturnOverview {
  id: string;
  description: string;
  date: string;
  details: {
    url: string;
    total_quantity: string | number;
    total_amount: string | number;
    serial_number: string;
  };
  return_entries: {
    return_price: string | number;
    return_quantity: string | number;
    stock_name: string;
  }[];
}



export interface PaymentDetails extends PaymentOverview {
  journal_entries: ResJournalEntry[];
  journal_entries_total: JournalTotals;
}