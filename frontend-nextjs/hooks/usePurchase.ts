"use client";

import { editPurchase, recordPurchase } from "@/app/actions/purchase-actions";
import { computePurchaseTotal } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { useSelectOptionsStore } from "@/stores/selectOptionsStore";
import { DebitCredit, JournalEntry, JournalType, Purchase, PurchaseEntry, PurchaseFormData, SelectOptions } from "@/types";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";


const defaultEntry: JournalEntry = {
  account: "",
  debit_credit: "debit",
  amount: 0,
  type: "purchase",
};

const defaultPurchaseEntry: PurchaseEntry = {
    stock: "",
    purchase_price: 0.0,
    purchased_quantity: 0
}

export function usePurchase(initial?: Partial<Purchase>){
  const {
    serial_numbers,
    purchaseAccounts,
    paymentAccounts,
    suppliersAccounts,
    incomeDiscountAccounts,
    stocks,
    setOptions,
  } = useSelectOptionsStore();  const { currentOrg } = useAuthStore();
  const [posting, setPosting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
 const [original, setOriginal] = useState<Purchase | null>(
  initial as Purchase ?? null
);
  const [purchase, setPurchase] = useState<PurchaseFormData>({
    date: initial?.date ?? "",
    due_date: initial?.due_date ?? "",
    description: initial?.description ?? "",
    serial_number: initial?.serial_number ?? serial_numbers.purchase,
    journal_entries: initial?.journal_entries ?? [{ ...defaultEntry, account: purchaseAccounts[0]?.id  }, {
      account: paymentAccounts[0]?.id,
      debit_credit: "credit",
      amount: 0,
      type: "payment",
    }],
    purchase_entries: initial?.purchase_entries ?? [{ ...defaultPurchaseEntry }]

  });
const journalEntriesDirtyByType = useMemo(() => {
  const current = purchase.journal_entries;
  const previous = original?.journal_entries ?? [];

  const types = ["purchase", "payment", "bill", "discount"] as const;

  const result: Record<(typeof types)[number], boolean> = {
    purchase: false,
    payment: false,
    bill: false,
    discount: false,
  };

  types.forEach((type) => {
    const curr = current.filter(e => e.type === type);
    const prev = previous.filter(e => e.type === type);

    result[type] = JSON.stringify(curr) !== JSON.stringify(prev);
  });

  return result;
}, [purchase.journal_entries, original?.journal_entries]);
  const dirtyState = useMemo(() => {
  const state = {
    serial_number: purchase.serial_number !== original?.serial_number,

    date: purchase.date !== original?.date,
    description: purchase.description !== original?.description,
    due_date: purchase.due_date !== original?.due_date,
    purchase_entries:
      JSON.stringify(purchase.purchase_entries) !==
      JSON.stringify(original?.purchase_entries ?? []),
  };

  if (!isEditing) {
    return {
      serial_number: false,
      date: false,
      description: false,
      due_date: false,
      purchase_entries: false,
    };
  }

  return state;
}, [
  isEditing,
  purchase.serial_number,
  original?.serial_number,
  purchase.date,
  purchase.description,
  purchase.due_date,
  purchase.purchase_entries,
  original?.date,
  original?.due_date,
  original?.description,
  original?.purchase_entries
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
    return purchase.journal_entries.reduce((acc, entry) => {
      const amount = Number(entry.amount || 0);
  
      return entry.debit_credit === "debit"
        ? acc + amount
        : acc - amount;
      }, 0);
  }, [purchase.journal_entries]);

  const purchaseTotal = useMemo(() => {
  return purchase.purchase_entries.reduce((amount, entry) => {
    const quantity = Number(entry.purchased_quantity || 0);
    const price = Number(entry.purchase_price || 0);

    return amount + (quantity * price);
  }, 0);
}, [purchase.purchase_entries]);



    const isDirty = (key: keyof typeof dirtyState) => {
  return dirtyState[key];
};
  const handleChange = (field: keyof PurchaseFormData, value: string) => {
    setPurchase((prev) => {
      return {
        ...prev,
        [field]: value
      };
    });
  }

 const addEntry = (type: JournalType, debitCredit: DebitCredit) => {
   setPurchase((prev) => ({
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
  setPurchase((prev) => {
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
    setPurchase((prev) => {
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
  const addPurchaseEntry = () => {
    setPurchase((prev) => ({
      ...prev,
      purchase_entries: [...prev.purchase_entries, { ...defaultPurchaseEntry }]
    }));
  };

  // -----------------------
  // UPDATE ENTRY
  // -----------------------
  const updatePurchaseEntry = <
  K extends keyof PurchaseEntry
>(
  index: number,
  field: K,
  value: PurchaseEntry[K]
) => {
    setPurchase((prev) => {
  const updated = [...prev.purchase_entries];

  updated[index] = {
    ...updated[index],
    [field]: value,
  };

  const total = computePurchaseTotal(updated);

  return {
    ...prev,
    purchase_entries: updated,
    journal_entries: prev.journal_entries.map((entry) =>
      entry.type === "purchase"
        ? { ...entry, amount: total }
        : entry
    ),
  };
});
  };

  // -----------------------
  // REMOVE ENTRY
  // -----------------------
  const removePurchaseEntry = (index: number) => {
   setPurchase((prev) => {
  const updated = prev.purchase_entries.filter((_, i) => i !== index);

  const total = computePurchaseTotal(updated);

  return {
    ...prev,
    purchase_entries: updated,
    journal_entries: prev.journal_entries.map((entry) =>
      entry.type === "purchase"
        ? { ...entry, amount: total }
        : entry
    ),
  };
});
  }


  const reset = (newPurchase?: PurchaseFormData, selectOptions?: SelectOptions) => {
    const serialNumbers = selectOptions?.serial_numbers;
    if (selectOptions) {
        setOptions(selectOptions);
    }
    setPurchase({
      date: newPurchase?.date ?? "",
      description: newPurchase?.description ?? "",
      due_date: newPurchase?.due_date ?? "",
      serial_number: newPurchase?.serial_number ?? serialNumbers?.purchase ?? "",
      journal_entries: newPurchase?.journal_entries ?? [{ ...defaultEntry, account: purchaseAccounts[0]?.id  }, {
        account: paymentAccounts[0]?.id,
        debit_credit: "credit",
        amount: 0,
        type: "payment",
      }],
      purchase_entries: newPurchase?.purchase_entries ?? [{ ...defaultPurchaseEntry }]   
    });
    setIsEditing(false);
  }

  const serialNumber =
    purchase.serial_number ||
    serial_numbers.purchase;


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPosting(true);

    try {
     const finalSerial =
        purchase.serial_number?.trim() || serialNumber;

      const payload = {
        ...purchase,
        serial_number: finalSerial,
      };
    const res = await recordPurchase(currentOrg?.id || "", payload);

    if (!res.success) {
        toast.error(res.error || "Something went wrong");
        return;
    }

    toast.success(res.message || "Purchase recorded.");
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
      toast.error("Organisation or purchase ID required");
      return;
    }

    setPosting(true);

    try {
      
      const res = await editPurchase(
        currentOrg.id,
        original?.id,
        purchase
      );

      if (!res?.success) {
        toast.error(res.error || "Update failed");
        return;
      }

      toast.success("Purchase updated");

      setOriginal(res.purchase);
      reset(res.purchase, res.select_options);
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
        purchase_entries: original?.purchase_entries ?? [defaultPurchaseEntry]
    })
  };

  const enableEditing = () => setIsEditing(true);
  return {
    purchase,
    difference,
    handleChange,
    updateEntry,
    addEntry,
    removeEntry,
    addPurchaseEntry,
    updatePurchaseEntry,
    removePurchaseEntry,
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
    purchaseAccounts,
    paymentAccounts,
    suppliersAccounts,
    incomeDiscountAccounts,
    stocks,
    purchaseTotal,
    serialNumber,
    isJournalTypeDirty
  };
}