import { create } from "zustand";
import { SelectOptions, Service, Stock } from "@/types";
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
  addService: (service: Service) => void;

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
    sales: "",
    service_income: "",
    purchase: "",
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
      const state = get();

      const accounts = data.accounts ?? state.accounts;
      const stocks = data.stocks ?? state.stocks;
      const services = data.services ?? state.services;
      const serial_numbers = data.serial_numbers ?? state.serial_numbers;
      const categories = data.categories ?? state.categories;
      const sub_categories = data.sub_categories ?? state.sub_categories;

      const buckets = getAccountBuckets(accounts);

      set({
        ...state,
        ...data,

        accounts,
        stocks,
        services,
        serial_numbers,
        categories,
        sub_categories,
        
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
    addService: (service) => {
      const services = [service, ...get().services];

      set({
        services,
      });
    },

    setSerialNumbers: (serial_numbers) => set({ serial_numbers }),

    clear: () => set(initialState),
  })
);