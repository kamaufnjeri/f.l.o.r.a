export interface SaleEntry {
  id?: string;
  stock_name: string;
  stock_unit_alias: string;
  sales_price: number;
  sold_quantity: number;
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

export interface SaleDetails {
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

export interface SaleDetail {
  id: string;
  serial_number: string;
  date: string;
  description: string;

  details: SaleDetails;

  invoice?: InvoiceInfo;

  sales_entries: SaleEntry[];

  journal_entries: JournalEntry[];

  journal_entries_total: JournalTotals;
}