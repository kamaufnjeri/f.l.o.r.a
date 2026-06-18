"use client";

import React from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import SelectField, { SelectOption } from "./SelectField";
import InputField from "./InputField";
import { debitCredit } from "@/constants";
import { JournalEntry } from "@/types";


type Props = {
  journalEntries: JournalEntry[];
  setJournalEntries: React.Dispatch<React.SetStateAction<JournalEntry[]>>;
  disabled?: boolean;
  accounts: SelectOption[];
  type?: 'journal';
  onMarkDirty?: () => void;
  isDirty?: boolean;
};

export default function JournalEntries({
  journalEntries,
  setJournalEntries,
  accounts,
  type = 'journal',
  disabled = false,
  onMarkDirty,
  isDirty
}: Props) {
  // 🔁 update single field
  const updateEntry = (
    index: number,
    field: keyof JournalEntry,
    value: string | number
  ) => {
    setJournalEntries((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return updated;
    });
    onMarkDirty?.(); // ✅ auto mark dirty on change
  };

  // ➕ add entry
  const addEntry = () => {
    setJournalEntries((prev) => [
      ...prev,
      {
        account: "",
        debit_credit: "debit",
        amount: 0,
        type: type
      },
    ]);
    onMarkDirty?.(); // ✅ auto mark dirty on change
  };

  // ❌ remove entry
  const removeEntry = (index: number) => {
    setJournalEntries((prev) =>
      prev.filter((_, i) => i !== index)
    );
    onMarkDirty?.(); // ✅ auto mark dirty on change
  };



  return (
    <div className="w-full space-y-5">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">
          Journal Entries
        </h2>
        {isDirty && <span className="text-yellow-500 text-xs">• edited</span>}

        <button
          type="button"
          onClick={addEntry}
          disabled={disabled}
          className="flex cursor-pointer items-center gap-2 px-4 py-2 rounded-lg bg-black text-white text-sm hover:bg-gray-800 transition"
        >
          <FaPlus />
          Add Entry
        </button>

      </div>

      {/* GRID HEADER (desktop only) */}
      <div className="hidden md:grid grid-cols-12 text-xs font-medium text-gray-500 px-2">
        <div className="col-span-4">Account</div>
        <div className="col-span-3">Type</div>
        <div className="col-span-3">Amount</div>
        <div className="col-span-2 text-right">Action</div>
      </div>

      {/* ROWS */}
      <div className="space-y-3" >
        {journalEntries.map((entry, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              {/* ACCOUNT */}
              <div className="md:col-span-4">
                <SelectField
                  label="Account"
                  value={entry.account}
                  options={accounts}
                  disabled={disabled}
                  onChange={(val) =>
                    updateEntry(index, "account", val)
                  }
                />
              </div>

              {/* DEBIT / CREDIT */}
              <div className="md:col-span-3">
                <SelectField
                  label="Type"
                  disabled={disabled}
                  value={entry.debit_credit}
                  options={debitCredit}
                  onChange={(val) =>
                    updateEntry(index, "debit_credit", val)
                  }
                />
              </div>

              {/* AMOUNT */}
              <div className="md:col-span-3">
                <InputField
                  label="Amount"
                  type="number"
                  disabled={disabled}
                  value={entry.amount}
                  onChange={(val) =>
                    updateEntry(index, "amount", val)
                  }
                />
              </div>

              {/* REMOVE */}
              <div className="md:col-span-2 flex justify-end">
                {(!disabled && journalEntries.length > 1) && (
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => removeEntry(index)}
                    className="p-2 cursor-pointer text-red-500 hover:bg-red-50 rounded-lg transition"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

     
    </div>
  );
}