"use client";

import { AccountingState, DebitCredit, JournalEntry } from "@/types";
import { useState } from "react";


export function useAccountingForm(initial?: Partial<AccountingState>) {
  const [form, setForm] = useState<AccountingState>({
    purchase: { account: "", debit_credit: 'debit', amount: 0.0, type: 'purchase'},
    sale: { account: "", debit_credit: 'credit', amount: 0.0, type: 'sale'},
    bill: null,
    invoice: null,
    discount: null,
    payment: [],
    ...initial,
  });

  // ➕ ADD
  const addEntry = (section: keyof AccountingState, debitCredit: DebitCredit) => {
    setForm((prev) => {
      if (section === "payment") {
        return {
          ...prev,
          payment: [
            ...prev.payment,
            {
              account: "",
              amount: 0,
              debit_credit: debitCredit,
              type: section,
            },
          ],
        };
      }

      return {
        ...prev,
        [section]: {
          account: "",
          amount: 0,
          debit_credit: debitCredit,
          type: section,
        },
      };
    });
  };

  // ✏️ UPDATE
  const updateEntry = (
    section: keyof AccountingState,
    field: keyof JournalEntry,
    value: string | number,
    index?: number,
  ) => {
    setForm((prev) => {
      if (section === "payment") {
        if (index === undefined) return prev;

        const updated = [...prev.payment];
        updated[index] = { ...updated[index], [field]: value };
        return { ...prev, payment: updated };
      }

      return {
        ...prev,
        [section]: {
          ...(prev[section] as JournalEntry),
          [field]: value,
        },
      };
    });
  };

  const removeEntry = (
    section: keyof AccountingState,
    index?: number
  ) => {
    setForm((prev) => {
      if (section === "payment") {
        if (index === undefined) return prev;

        return {
          ...prev,
          payment: prev.payment.filter((_, i) => i !== index),
        };
      }

      // single-entry sections → reset to null
      return {
        ...prev,
        [section]: null,
      };
    });
  };

  return {
    form,
    setForm,
    addEntry,
    updateEntry,
    removeEntry,
  };
}