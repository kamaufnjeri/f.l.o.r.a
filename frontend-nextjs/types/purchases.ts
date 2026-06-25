export interface PurchaseEntry {
  id?: string;
  stock_name: string;
  purchase_price: number;
  quantity: number;
  total_purchase_price: number;
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

export interface PurchaseDetails {
  type: string;
  total_quantity: number;
  total_amount: number;
  has_returns: boolean;
  footer_data?: Record<string, string | number>;
}

export interface PurchaseJournalTotals {
  debit_total: number;
  credit_total: number;
}

export interface PurchaseDetail {
  id: string;
  serial_number: string;
  date: string;
  description: string;

  details: PurchaseDetails;

  bill?: InvoiceInfo;

  purchase_entries: PurchaseEntry[];

  journal_entries: JournalEntry[];

  journal_entries_total: PurchaseJournalTotals;
}