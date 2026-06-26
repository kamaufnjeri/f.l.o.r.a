"use client";

import { editSale, recordSale } from "@/app/actions/sale-actions";
import { computeSaleTotal } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { useSelectOptionsStore } from "@/stores/selectOptionsStore";
import { DebitCredit, JournalEntry, JournalType, Sale, SaleEntry, SaleFormData, SelectOptions } from "@/types";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";


const defaultEntry: JournalEntry = {
  account: "",
  debit_credit: "credit",
  amount: 0,
  type: "sales",
};

const defaultSaleEntry: SaleEntry = {
    stock: "",
    sales_price: 0.0,
    sold_quantity: 0
}

export function useSale(initial?: Partial<Sale>){
  const {
    serial_numbers,
    salesAccounts,
    paymentAccounts,
    customersAccounts,
    expenseDiscountAccounts,
    stocks,
    setOptions,
  } = useSelectOptionsStore();  const { currentOrg } = useAuthStore();
  const [posting, setPosting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
 const [original, setOriginal] = useState<Sale | null>(
  initial as Sale ?? null
);
  const [sale, setSale] = useState<SaleFormData>({
    date: initial?.date ?? "",
    due_date: initial?.due_date ?? "",
    description: initial?.description ?? "",
    serial_number: initial?.serial_number ?? serial_numbers.sales,
    journal_entries: initial?.journal_entries ?? [{ ...defaultEntry, account: salesAccounts[0]?.id  }, {
      account: paymentAccounts[0]?.id,
      debit_credit: "debit",
      amount: 0,
      type: "payment",
    }],
    sales_entries: initial?.sales_entries ?? [{ ...defaultSaleEntry }]

  });

 const journalEntriesDirtyByType = useMemo(() => {
  const current = sale.journal_entries;
  const previous = original?.journal_entries ?? [];

  const types = ["sale", "payment", "invoice", "discount"] as const;

  const result: Record<(typeof types)[number], boolean> = {
    sale: false,
    payment: false,
    invoice: false,
    discount: false,
  };

  types.forEach((type) => {
    const curr = current.filter(e => e.type === type);
    const prev = previous.filter(e => e.type === type);

    result[type] = JSON.stringify(curr) !== JSON.stringify(prev);
  });

  return result;
}, [sale.journal_entries, original?.journal_entries]);
  const dirtyState = useMemo(() => {
  const state = {
    serial_number: sale.serial_number !== original?.serial_number,

    date: sale.date !== original?.date,
    description: sale.description !== original?.description,
    due_date: sale.due_date !== original?.due_date,
    sales_entries:
      JSON.stringify(sale.sales_entries) !==
      JSON.stringify(original?.sales_entries ?? []),
  };

  if (!isEditing) {
    return {
      serial_number: false,
      date: false,
      description: false,
      due_date: false,
      sales_entries: false,
    };
  }

  return state;
}, [
  isEditing,
  sale.serial_number,
  original?.serial_number,
  sale.date,
  sale.description,
  sale.due_date,
  sale.sales_entries,
  original?.date,
  original?.due_date,
  original?.description,
  original?.sales_entries
]);

const isJournalTypeDirty = (type: keyof typeof journalEntriesDirtyByType) =>
  journalEntriesDirtyByType[type];

const journalChanged = Object.values(journalEntriesDirtyByType).some(Boolean);

const hasChanges = useMemo(() => {
  if (!isEditing) return false;

  return (
    Object.values(dirtyState).some(Boolean) ||
    journalChanged
  );
}, [dirtyState, journalChanged, isEditing]);
  const difference = useMemo(() => {
    return sale.journal_entries.reduce((acc, entry) => {
      const amount = Number(entry.amount || 0);
  
      return entry.debit_credit === "debit"
        ? acc + amount
        : acc - amount;
      }, 0);
  }, [sale.journal_entries]);

  const saleTotal = useMemo(() => {
  return sale.sales_entries.reduce((amount, entry) => {
    const quantity = Number(entry.sold_quantity || 0);
    const price = Number(entry.sales_price || 0);

    return amount + (quantity * price);
  }, 0);
}, [sale.sales_entries]);



    const isDirty = (key: keyof typeof dirtyState) => {
  return dirtyState[key];
};
  const handleChange = (field: keyof SaleFormData, value: string) => {
    setSale((prev) => {
      return {
        ...prev,
        [field]: value
      };
    });
  }

 const addEntry = (type: JournalType, debitCredit: DebitCredit) => {
   setSale((prev) => ({
    ...prev,
    journal_entries: [...prev.journal_entries, {
      account: "",
      debit_credit: debitCredit,
      amount: 0,
      type
    }],
  }));
};

const updateEntry = <
  K extends keyof JournalEntry
>(
  index: number,
  field: K,
  value: JournalEntry[K]
) => {
  setSale((prev) => {
    const updated = [...prev.journal_entries];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    return {
      ...prev,
      journal_entries: updated,
    };
  });

};

  const removeEntry = (index: number) => {
    setSale((prev) => {
      const oldEntries = [...prev.journal_entries];
      const updated = oldEntries.filter((_, i) => i !==index);

      return {
        ...prev,
        journal_entries: updated,
      }
    });

  }

 
  // -----------------------
  // ADD ENTRY
  // -----------------------
  const addSaleEntry = () => {
    setSale((prev) => ({
      ...prev,
      sales_entries: [...prev.sales_entries, { ...defaultSaleEntry }]
    }));
  };

  // -----------------------
  // UPDATE ENTRY
  // -----------------------
  const updateSaleEntry = <
  K extends keyof SaleEntry
>(
  index: number,
  field: K,
  value: SaleEntry[K]
) => {
    setSale((prev) => {
  const updated = [...prev.sales_entries];

  updated[index] = {
    ...updated[index],
    [field]: value,
  };

  const total = computeSaleTotal(updated);

  return {
    ...prev,
    sales_entries: updated,
    journal_entries: prev.journal_entries.map((entry) =>
      entry.type === "sales"
        ? { ...entry, amount: total }
        : entry
    ),
  };
});
  };

  // -----------------------
  // REMOVE ENTRY
  // -----------------------
  const removeSaleEntry = (index: number) => {
   setSale((prev) => {
  const updated = prev.sales_entries.filter((_, i) => i !== index);

  const total = computeSaleTotal(updated);

  return {
    ...prev,
    sales_entries: updated,
    journal_entries: prev.journal_entries.map((entry) =>
      entry.type === "sales"
        ? { ...entry, amount: total }
        : entry
    ),
  };
});
  }


  const reset = (newSale?: SaleFormData, selectOptions?: SelectOptions) => {
    const serialNumbers = selectOptions?.serial_numbers;
    if (selectOptions) {
        setOptions(selectOptions);
    }
    setSale({
      date: newSale?.date ?? "",
      description: newSale?.description ?? "",
      due_date: newSale?.due_date ?? "",
      serial_number: newSale?.serial_number ?? serialNumbers?.sales ?? "",
      journal_entries: newSale?.journal_entries ?? [{ ...defaultEntry, account: salesAccounts[0]?.id  }, {
        account: paymentAccounts[0]?.id,
        debit_credit: "debit",
        amount: 0,
        type: "payment",
      }],
      sales_entries: newSale?.sales_entries ?? [{ ...defaultSaleEntry }]   
    });
    setIsEditing(false);
  }

  const serialNumber =
    sale.serial_number ||
    serial_numbers.sales;


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPosting(true);

    try {
     const finalSerial =
        sale.serial_number?.trim() || serialNumber;

      const payload = {
        ...sale,
        serial_number: finalSerial,
      };
    const res = await recordSale(currentOrg?.id || "", payload);

    if (!res.success) {
        toast.error(res.error || "Something went wrong");
        return;
    }

    toast.success(res.message || "Sale recorded.");
    const selectOptions = res.select_options;
     reset(undefined, selectOptions);    
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again");
    } finally {
      setPosting(false);
    }
  };

 const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentOrg?.id || !original?.id) {
      toast.error("Organisation or sale ID required");
      return;
    }

    setPosting(true);

    try {
      
      const res = await editSale(
        currentOrg.id,
        original?.id,
        sale
      );

      if (!res?.success) {
        toast.error(res.error || "Update failed");
        return;
      }

      toast.success("Sale updated");

      setOriginal(res.sale);
      reset(res.sale, res.select_options)
    } catch (err) {
      console.error(err);
      toast.error("Save failed");
    } finally {
      setPosting(false);
    }
  };

  const cancelEdit = () => {
    reset({
        date: original?.date ?? "",
        description: original?.description ?? "",
        due_date: original?.due_date ?? "",
        serial_number: original?.serial_number ?? "",
        journal_entries: original?.journal_entries ?? [defaultEntry],
        sales_entries: original?.sales_entries ?? [defaultSaleEntry]
    })
  };

  const enableEditing = () => setIsEditing(true);
  return {
    sale,
    difference,
    handleChange,
    updateEntry,
    addEntry,
    removeEntry,
    addSaleEntry,
    updateSaleEntry,
    removeSaleEntry,
    reset,
    currentOrg,
    handleSubmit,
    posting,
    original,
    handleUpdate,
    isDirty,
    cancelEdit,
    hasChanges,
    isEditing,
    enableEditing,
    salesAccounts,
    paymentAccounts,
    customersAccounts,
    expenseDiscountAccounts,
    stocks,
    saleTotal,
    serialNumber,
    isJournalTypeDirty
  };
}