"use client";

import { FaPlus, FaTrash } from "react-icons/fa";
import SelectField, { SelectOption } from "./SelectField";
import InputField from "./InputField";
import { debitCredit } from "@/constants";
import { DebitCredit, JournalEntry } from "@/types";


type Props = {
  entries: JournalEntry[];
  updateEntry:  <
  K extends keyof JournalEntry
>(
  index: number,
  field: K,
  value: JournalEntry[K]
) => void;
  addEntry: () => void;
  removeEntry: (index: number) => void;
  disabled?: boolean;
  accounts: SelectOption[];
  isDirty?: boolean;
};

export default function JournalEntries({
  entries,
  updateEntry,
  addEntry,
  removeEntry,
  accounts,
  disabled = false,
  isDirty
}: Props) {
  

  return (
    <div className="w-full space-y-5">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">
          Journal Entries
        </h2>
        {isDirty && <span className="text-yellow-500 text-xs">• edited</span>}

        {!disabled && <button
          type="button"
          onClick={addEntry}
          disabled={disabled}
          className="flex cursor-pointer items-center gap-2 px-4 py-2 rounded-lg bg-black text-white text-sm hover:bg-gray-800 transition"
        >
          <FaPlus />
          Add Entry
        </button>}

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
        {entries.map((entry, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              {/* ACCOUNT */}
              <div className="md:col-span-4">
                <SelectField
                  value={entry.account}
                  options={accounts}
                  disabled={disabled}
                  onChange={(val) =>
                    updateEntry(index, "account", val as string)
                  }
                />
              </div>

              {/* DEBIT / CREDIT */}
              <div className="md:col-span-3">
                <SelectField
                  disabled={disabled}
                  value={entry.debit_credit}
                  options={debitCredit}
                  onChange={(val) =>
                    updateEntry(index, "debit_credit", val as DebitCredit)
                  }
                />
              </div>

              {/* AMOUNT */}
              <div className="md:col-span-3">
                <InputField
                  type="number"
                  disabled={disabled}
                  value={entry.amount}
                  onChange={(val) =>
                    updateEntry(index, "amount", Number(val))
                  }
                />
              </div>

              {/* REMOVE */}
              <div className="md:col-span-2 flex justify-end">
                {(!disabled && entries.length > 1) && (
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