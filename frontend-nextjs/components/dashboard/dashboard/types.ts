export type StockSummary = {
  id: string;
  name: string;
  rate: number;
  quantity: number;
  amount: number;
};


export type InventorySummary = {
  stocks: StockSummary[];
  closing_stock: number;
  opening_stock: number;
  inventory: number;
};


export type DashboardSummary = {
  cash: number;
  receivables: number;
  payables: number;
  profit: number;
  inventory: InventorySummary;
};



export type IncomeExpense = {
  sales: number;
  sales_returns: number;
  purchases: number;
  purchase_returns: number;
  gross_profit: number;
  total_other_income: number;
  total_service_income: number;
  expenses: number;
  profit: number;
};



export type RecentTransaction = {
  id: string;
  serial_number?: string | null;
  type: string;
  description: string;
  date: string;
  supplier_name?: string | null;
  customer_name?: string | null;
  url: string;
  entered_by: string;
};



export type QuickStats = {
  customers: number;
  suppliers: number;
  accounts: number;
  products: number;
  services: number;
};



export type DashboardData = {
  summary: DashboardSummary;
  income_expense: IncomeExpense;
  recent_transactions: RecentTransaction[];
  quick_stats: QuickStats;
};
