

export interface ReturnEntry {
  id?: string;
  stock_name?: string;
  purchase_entry?: string;
  sales_entry?: string;
  return_price?: number;
  quantity?: number;
  return_quantity: number;
}

export interface ReturnFormData {
  id?: string;
  date: string;
  description: string;
  purchase?: string | null;
  sales?: string | null;
  return_entries: ReturnEntry[];
}
export interface ReturnDetails {
  url: string;
  serial_number: string;
  total_quantity: number;
  total_amount: number;
  stocks?: { id: string, name: string}[];
}

export interface ReturnOverview {
  id: string;
  date: string;
  description: string;
  purchase?: string | null;
  sales?: string | null;
  details: ReturnDetails;
  return_entries: ReturnEntry[];
}

export interface ReturnTotals {
  quantity: number;
  amount: number;
}



export interface JournalEntry {
  account_name: string;
  debit_credit: "debit" | "credit";
  amount: number;
}

export interface JournalEntriesTotal {
  debit_total: number;
  credit_total: number;
}




export interface Return extends ReturnOverview {
  journal_entries?: JournalEntry[];
  journal_entries_total?: JournalEntriesTotal;
}
