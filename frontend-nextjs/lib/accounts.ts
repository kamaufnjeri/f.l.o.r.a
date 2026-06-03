import { Account } from "@/types";

type AccountGroupKey =
  | "payment"
  | "purchase"
  | "sales"
  | "service_income"
  | "customers"
  | "suppliers"
  | "income_discount"
  | "expense_discount";

const RULES: Record<AccountGroupKey, (a: Account) => boolean> = {
  payment: (a) => a.sub_category === "Cash and Cash Equivalents",
  purchase: (a) => a.sub_category === "Cost of Goods Sold",
  sales: (a) => a.sub_category === "Product Sales",
  service_income: (a) => a.sub_category === "Service Income",
  customers: (a) => a.sub_category === "Accounts Receivable",
  suppliers: (a) => a.sub_category === "Accounts Payable",
  income_discount: (a) => a.sub_category === "Income from Discounts",
  expense_discount: (a) => a.sub_category === "Expense from Discounts",
};

export function getAccountsByGroup(
  accounts: Account[],
  group: AccountGroupKey
): Account[] {
  return accounts.filter(RULES[group]);
}

