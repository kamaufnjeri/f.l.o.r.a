import { create } from "zustand";
import { SelectOptions, Stock } from "@/types";
import { Account } from "@/types";

const norm = (v?: string) => (v ?? "").trim().toLowerCase();

export const getAccountBuckets = (accounts: Account[]) => {
  const filter = (type: string) =>
    accounts.filter((a) => norm(a.sub_category) === type);

  return {
    paymentAccounts: filter("cash and cash equivalents"),
    purchaseAccounts: filter("cost of goods sold"),
    salesAccounts: filter("product sales"),
    serviceIncomeAccounts: filter("service income"),
    customersAccounts: filter("accounts receivable"),
    suppliersAccounts: filter("accounts payable"),
    incomeDiscountAccounts: filter("income from discounts"),
    expenseDiscountAccounts: filter("expense from discounts"),
  };
};
type SelectOptionsStore = SelectOptions & {
  setOptions: (data: SelectOptions) => void;
  addAccount: (account: Account) => void;
  addStock: (stock: Stock) => void;

  setSerialNumbers: (sn: SelectOptions["serial_numbers"]) => void;
  clear: () => void;
};

const initialState: SelectOptions = {
  accounts: [],

  suppliersAccounts: [],
  customersAccounts: [],
  paymentAccounts: [],
  purchaseAccounts: [],
  salesAccounts: [],
  serviceIncomeAccounts: [],
  incomeDiscountAccounts: [],
  expenseDiscountAccounts: [],

  stocks: [],
  serial_numbers: {
    journal: "",
    sale: "",
    service: "",
    purchase: "",
    payment: "",
    bill: "",
    invoice: "",
  },
  fixed_groups: [],
  categories: [],
  sub_categories: [],
  services: [],
};

export const useSelectOptionsStore = create<SelectOptionsStore>(
  (set, get) => ({
    ...initialState,

    setOptions: (data) => {
      const accounts = data.accounts ?? [];

      const buckets = getAccountBuckets(accounts);

      set({
        ...data,
        accounts,
        ...buckets,
      });
    },

    addAccount: (account) => {
      const accounts = [account, ...get().accounts];
      const buckets = getAccountBuckets(accounts);

      set({
        accounts,
        ...buckets,
      });
    },
    addStock: (stock) => {
      const stocks = [stock, ...get().stocks];

      set({
        stocks,
      });
    },

    setSerialNumbers: (serial_numbers) => set({ serial_numbers }),

    clear: () => set(initialState),
  })
);