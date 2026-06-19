"use client";

import { PurchaseEntry } from "@/types";
import { useState } from "react";


export type PurchaseState = {
  date: string;
  dueDate: string;
  description: string;
  purchaseEntries: PurchaseEntry[];
};

export function usePurchaseItem(initial?: Partial<PurchaseState>) {
  const [date, setDate] = useState<string>(initial?.date ?? "");
  const [dueDate, setDueDate] = useState<string>(initial?.dueDate ?? "");
  const [description, setDescription] = useState<string>(initial?.description ?? "");
  const [purchaseEntries, setPurchaseEntries] = useState<PurchaseEntry[]>(
    initial?.purchaseEntries ?? [{ stock: null, purchased_quantity: 0, purchase_price: 0.0 }]
  );

  // -----------------------
  // ADD ENTRY
  // -----------------------
  const addPurchaseEntry = () => {
    setPurchaseEntries((prev) => [
      ...prev,
      {
        stock: null,
        purchased_quantity: 0,
        purchase_price: 0,
      },
    ]);
  };

  // -----------------------
  // UPDATE ENTRY
  // -----------------------
  const updatePurchaseEntry = (
    index: number,
    field: keyof PurchaseEntry,
    value: string | number
  ) => {
    setPurchaseEntries((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return updated;
    });
  };

  // -----------------------
  // REMOVE ENTRY
  // -----------------------
  const removePurchaseEntry = (index: number) => {
    setPurchaseEntries((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  // -----------------------
  // OPTIONAL: RESET
  // -----------------------
  const reset = () => {
    setDate("");
    setDueDate("");
    setDescription("");
    setPurchaseEntries([]);
  };

  return {
    // state
    date,
    dueDate,
    description,
    purchaseEntries,

    // setters (your requested style)
    setDate,
    setDueDate,
    setDescription,
    setPurchaseEntries,

    // entry helpers
    addPurchaseEntry,
    updatePurchaseEntry,
    removePurchaseEntry,

    // utils
    reset,
  };
}