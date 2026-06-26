"use client";

import { useState } from "react";
import { DebitCredit, JournalEntry, JournalType } from "@/types";
import InputField from "../journals/InputField";
import SelectField, { SelectOption } from "../journals/SelectField";
import { FaTrash } from "react-icons/fa";
import { capitalizeFirstLetter } from "@/lib/utils";
import { Entry } from "./PurchaseSalesAccountField";

type Props = {
  debitCredit: DebitCredit;
  type: "bill" | "invoice";
  entryData: Entry;
  dueDate: string;
  changeDueDate: (field: "due_date", value: string) => void;
  accounts: SelectOption[];
  isDirty?: boolean;
  disabled?: boolean;
  updateEntry: <
    K extends keyof JournalEntry
  >(
    index: number,
    field: K,
    value: JournalEntry[K]
  ) => void;
  addEntry: (type: JournalType, debitCredit: DebitCredit) => void;
  removeEntry: (index: number) => void;
};

export default function BillInvoiveAccountField({
  debitCredit,
  type,
  entryData,
  dueDate,
  changeDueDate,
  accounts,
  isDirty = false,
  disabled = false,
  updateEntry,
  addEntry,
  removeEntry,
}: Props) {
  const [showBill, setShowBill] = useState(false);

  const { entry, index } = entryData ?? {
    entry: null,
    index: -1,
  };

  const title = capitalizeFirstLetter(type);

  return (
    <div className="bg-white rounded-3xl border shadow-sm p-6 space-y-5">

      {/* HEADER */}
      <div className="flex flex-wrap justify-between items-center gap-2">

        {/* TITLE */}
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900">
            {title}
          </h2>

          {isDirty && (
            <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
              edited
            </span>
          )}
        </div>

        {/* ACTIONS */}
        {(!showBill && !entry) ? (
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              addEntry(type, debitCredit);
              setShowBill(true);
            }}
            className="cursor-pointer border-2 border-dashed border-blue-200 bg-blue-50 text-blue-600 rounded-2xl p-2 hover:bg-blue-100 transition"
          >
            + Add {title}
          </button>
        ) : (
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              removeEntry(index);
              setShowBill(false);
              changeDueDate("due_date", "");
            }}
            className="cursor-pointer text-red-500 hover:bg-red-50 px-3 py-2 rounded-xl transition"
          >
            <FaTrash />
          </button>
        )}
      </div>

      {/* FORM */}
      {(showBill || entry) && (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-4">

          <InputField
            label="Due Date"
            type="date"
            value={dueDate}
            disabled={disabled}
            onChange={(val) => changeDueDate("due_date", val)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <SelectField
              label="Account"
              value={entry.account || ""}
              options={accounts}
              onChange={(val) =>
                updateEntry(index, "account", val as string)
              }
              disabled={disabled}
            />

            <InputField
              label="Amount"
              type="number"
              value={entry.amount}
              onChange={(val) =>
                updateEntry(index, "amount", Number(val))
              }
              disabled={disabled}
            />

          </div>

        </div>
      )}

    </div>
  );
}