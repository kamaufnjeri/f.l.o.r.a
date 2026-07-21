export interface StatementAccount {
  id: string;
  name: string;
  amount: number;
}

export interface StatementGroup {
  name: string;
  total: number;
  categories: {
    name: string;
    total: number;
    sub_categories: {
      name: string;
      total: number;
      accounts: StatementAccount[];
    }[];
  }[];
}

export interface IncomeStatementData {
  opening_stock: number;
  closing_stock: number;

  sales_accounts: StatementAccount[];
  sales_returns_account: StatementAccount | null;
  net_sales: number;

  purchase_accounts: StatementAccount[];
  purchase_returns_account: StatementAccount | null;
  net_purchases: number;

  goods_available: number;
  cost_of_goods_sold: number;
  gross_profit: number;

  service_income_accounts: StatementAccount[];
  service_income_total: number;

  operating_income: number;

  other_income_groups: StatementGroup[];

  expenses_groups: StatementGroup[];

  net_profit: number;
}