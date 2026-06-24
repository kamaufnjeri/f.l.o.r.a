export interface SalesEntry {
  stock_name: string;
  sales_price: number;
  quantity: number;
  total_sales_price: number;
}

export interface JournalEntry {
  account_name: string;
  debit_credit: "debit" | "credit";
  amount: number;
}

export interface InvoiceInfo {
  id: string;
  customer_name: string;
  status: string;
  due_date: string;
  amount_due: number;
}

export interface SalesDetails {
  type: string;
  total_quantity: number;
  total_amount: number;
  has_returns: boolean;
  footer_data?: Record<string, string | number>;
}

export interface JournalTotals {
  debit_total: number;
  credit_total: number;
}

export interface SalesDetail {
  id: string;
  serial_number: string;
  date: string;
  description: string;

  details: SalesDetails;

  invoice?: InvoiceInfo;

  sales_entries: SalesEntry[];

  journal_entries: JournalEntry[];

  journal_entries_total: JournalTotals;
}