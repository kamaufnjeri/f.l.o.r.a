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
export type DebitCredit = 'debit' | 'credit';

export interface JournalEntry {
  account: string | "";
  debit_credit: DebitCredit;
  amount: number;
  type: 'journal';
}

export interface JournalFormData {
  date: string | null;
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
  sale: string;
  service: string;
  purchase: string;
  payment: string;
  bill: string;
  invoice: string;
}

export interface FixedGroup {
  id: string;
  name: string;
  value: string;
}

export interface SelectOptions {
  suppliers_accounts: Supplier[];
  customers_accounts: Customer[];

  stocks: Stock[];
  accounts: Account[];

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