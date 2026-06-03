import { create } from "zustand";
import { SelectOptions } from "@/types";

type SelectOptionsStore = SelectOptions & {
  setOptions: (data: SelectOptions) => void;

  addAccount: (account: SelectOptions["accounts"][number]) => void;
  setSerialNumbers: (serial_numbers: SelectOptions["serial_numbers"]) => void;
  clear: () => void;
};

const initialState: SelectOptions = {
  suppliers_accounts: [],
  customers_accounts: [],

  stocks: [],
  accounts: [],

  serial_numbers: { journal: "", sale: "", service: "", purchase: "", payment: "", bill: "", invoice: "" },

  fixed_groups: [],
  categories: [],
  sub_categories: [],
  services: [],
};

export const useSelectOptionsStore = create<SelectOptionsStore>(
  (set, get) => ({
    ...initialState,

    setOptions: (data) => set({ ...data }),

    addAccount: (account) =>
      set({
        accounts: [account, ...get().accounts],
      }),
    setSerialNumbers: (serial_numbers: SelectOptions["serial_numbers"]) => set({ serial_numbers }),

    clear: () => set(initialState),
  })
);