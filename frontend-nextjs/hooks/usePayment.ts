"use client";

import { editPayment, recordPayment } from "@/app/actions/payment-actions";
import { useAuthStore } from "@/stores/authStore";
import { useSelectOptionsStore } from "@/stores/selectOptionsStore";
import { PaymentFormData, Payment, SelectOptions, JournalEntry } from "@/types";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";


export function usePayment(type: "debit" | "credit", revalidateUrl?: string | null, initial?: Partial<Payment>){
  const { setOptions, paymentAccounts } = useSelectOptionsStore();
  const { currentOrg } = useAuthStore();
  const [posting, setPosting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [original, setOriginal] = useState<Payment | null>(
    initial as Payment ?? null
  );
  const [payment, setPayment] = useState<PaymentFormData>({
    date: initial?.date ?? "",
    description: initial?.description ?? "",
    bill: initial?.bill ?? null,
    invoice: initial?.invoice ?? null,
    journal_entries: initial?.journal_entries ?? [{ amount: 0, debit_credit: type, account: "", type: "payment" }]
  });
  
  const dirtyState = useMemo(() => {
  const state = {
    date: payment.date !== original?.date,
    description: payment.description !== original?.description,
    journal_entries:
      JSON.stringify(payment.journal_entries) !==
      JSON.stringify(original?.journal_entries ?? []),
  };

  if (!isEditing) {
    return {
      date: false,
      description: false,
      journal_entries: false,
    };
  }

  return state;
}, [
  isEditing,
  payment.date,
  payment.description,
  payment.journal_entries,
  original?.date,
  original?.description,
  original?.journal_entries,
]);
    const isDirty = (key: keyof typeof dirtyState) => {
  return dirtyState[key];
};
const hasChanges = Object.values(dirtyState).some(Boolean);
const totalAmount = useMemo(() => {
  return payment.journal_entries.reduce((acc, entry) => {
    if (entry.debit_credit === type) {
      return acc + Number(entry.amount || 0);
    }

    return acc;
  }, 0);
}, [payment.journal_entries, type]);

const entriesLength = useMemo(() => {
  return payment.journal_entries.filter(
    (entry) => entry.debit_credit === type
  ).length;
}, [payment.journal_entries, type]);

  const handleChange = (field: keyof PaymentFormData, value: string) => {
    setPayment((prev) => {
      return {
        ...prev,
        [field]: value
      };
    });
  }

 const addEntry = () => {
  setPayment((prev) => ({
    ...prev,
    journal_entries: [...prev.journal_entries, { amount: 0, debit_credit: type, account: "", type: "payment"  }],
  }));
};

const updateEntry = <
  K extends keyof JournalEntry
>(
  index: number,
  field: K,
  value: JournalEntry[K]
) => {
  setPayment((prev) => {
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
    setPayment((prev) => {
      const oldEntries = [...prev.journal_entries];
      const updated = oldEntries.filter((_, i) => i !==index);

      return {
        ...prev,
        journal_entries: updated,
      }
    });

  }

  const reset = (newPayment?: PaymentFormData, selectOptions?: SelectOptions) => {
    if (selectOptions) {
        setOptions(selectOptions);
    }
    setPayment({
      date: newPayment?.date ?? "",
      description: newPayment?.description ?? "",
      journal_entries: newPayment?.journal_entries ?? [{ amount: 0, debit_credit: type, account: "", type: "payment" }]    });
    setIsEditing(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPosting(true);

   

    try {
      if (!revalidateUrl) {
        toast.error('Revalidate url required');
        return;
      }
      
    const res = await recordPayment(currentOrg?.id || "", revalidateUrl as string, payment);

    if (!res.success) {
        toast.error(res.error || "Something went wrong");
        return;
    }

    toast.success(res.message || "Payment entry created");
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
      toast.error("Organisation or payment ID required");
      return;
    }

    if (!revalidateUrl) {
        toast.error('Revalidate url required');
        return
      }

    setPosting(true);

    try {
     const updatedEntries = payment.journal_entries.map((entry) => ({
      ...entry,
      amount:
        entry.type === "bill" || entry.type === "invoice"
          ? Math.max(0, totalAmount)
          : entry.amount,
    }));

    const payload = {
      ...payment,
      journal_entries: updatedEntries,
    };
      const res = await editPayment(
        currentOrg.id,
        original?.id,
        payload,
        revalidateUrl
      );
      

      if (!res?.success) {
        toast.error(res.error || "Update failed");
        return;
      }

      toast.success("Payment updated");

      setOriginal(res.payment);
      reset(res.payment, res.select_options);
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
        journal_entries: original?.journal_entries ?? [{ amount: 0, debit_credit: type, account: "", type: "payment" }],
    })
  };

  const enableEditing = () => setIsEditing(true);

  return {
    payment,
    totalAmount,
    handleChange,
    updateEntry,
    addEntry,
    removeEntry,
    reset,
    paymentAccounts,
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
    entriesLength,
  };
}