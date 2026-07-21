export interface TrialBalanceAccount {
  id: string;
  name: string;
  amount: number;
  balance_type: "debit" | "credit";
}

export interface TrialBalanceSubCategory {
  id: string;
  name: string;
  amount: number;
  balance_type: "debit" | "credit";
  accounts: TrialBalanceAccount[];
}

export interface TrialBalanceCategory {
  id: string;
  name: string;
  amount: number;
  balance_type: "debit" | "credit";
  sub_categories: TrialBalanceSubCategory[];
}

export interface TrialBalanceFixedGroup {
  id: number;
  name: string;
  amount: number;
  balance_type: "debit" | "credit";
  categories: TrialBalanceCategory[];
}

export interface TrialBalanceResponse {
  fixed_groups: TrialBalanceFixedGroup[];
  totals: {
    debit: number;
    credit: number;
  };
}