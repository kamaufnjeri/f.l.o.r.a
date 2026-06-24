export type JournalEntry = {
  account_name: string;
  amount: number;
  debit_credit: "debit" | "credit";
};

export type JournalEntriesTotal = {
  debit_total: number;
  credit_total: number;
};

export type ServiceIncomeEntry = {
  service_name: string;
  price: number;
  quantity: number;
  service_income_total: number;
};

export type ServiceIncomeInvoice = {
  id: string;
  customer_name: string;
  status: string;
  due_date: string;
  amount_due: number;
};

export type ServiceIncomeDetails = {
  type: string;
  total_quantity: number;
  total_amount: number;
  has_returns: boolean;
  footer_data?: Record<string, string | number>;
};

export type ServiceIncomeDetail = {
  id: string;
  serial_number: string;
  date: string;
  description: string;

  details: ServiceIncomeDetails;

  invoice?: ServiceIncomeInvoice;

  service_income_entries: ServiceIncomeEntry[];

  journal_entries: JournalEntry[];

  journal_entries_total: JournalEntriesTotal;
};