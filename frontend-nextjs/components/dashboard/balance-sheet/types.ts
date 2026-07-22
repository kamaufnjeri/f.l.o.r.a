export interface Account {
  id: string;
  name: string;
  amount: number;
  balance_type: "debit" | "credit";
}

export interface Stock {
  id: string;
  name: string;
  rate: number;
  quantity: number;
  amount: number;
}

export interface Inventory {
  stocks: Stock[];
  closing_stock: number;
  opening_stock: number;
  inventory: number;
}

export interface AssetSection {
  current: {
    [key: string]: Account[] | Inventory;
    Inventory: Inventory;
  };

  non_current: {
    [key: string]: Account[];
  };

  total_current: number;
  total_non_current: number;
  total: number;
}

export interface LiabilitySection {
  current: {
    [key: string]: Account[];
  };

  non_current: {
    [key: string]: Account[];
  };

  total_current: number;
  total_non_current: number;
  total: number;
}

export interface CapitalSection {
  owner_equity: {
    [key: string]: Account[];
  };

  retained_earnings: {
    name: string;
    amount: number;
  };

  total: number;
}

export interface TotalsSection {
  assets: number;
  liabilities: number;
  capital: number;
  balanced: boolean;
}

export interface BalanceSheetResponse {
  assets: AssetSection;
  liabilities: LiabilitySection;
  capital: CapitalSection;
  totals: TotalsSection;
}