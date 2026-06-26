import { useState } from "react";
import { DebitCredit, JournalEntry, JournalType } from "@/types";
import InputField from "../journals/InputField";
import SelectField, { SelectOption } from "../journals/SelectField";
import { FaTrash } from "react-icons/fa";
import { Entry } from "./PurchaseSalesAccountField";

type Props = {
  debitCredit: DebitCredit;
  entryData: Entry,
  purchaseTotal: number;
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

export default function DiscountAccountField({
  debitCredit,
  entryData,
  purchaseTotal,
  accounts,
  isDirty = false,
  disabled = false,
  updateEntry,
  addEntry,
  removeEntry,
}: Props) {
  const [showDiscount, setShowDiscount] = useState(false);
  const { entry, index } = entryData ?? {
    entry: null,
    index: -1,
  }; return (
    <div className="bg-white rounded-3xl border shadow-sm p-6 space-y-5">

  {/* HEADER */}
      <div className="flex flex-wrap justify-between items-center gap-2">

        {/* TITLE */}
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900">
            Discount
          </h2>

          {isDirty && (
            <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
              edited
            </span>
          )}
        </div>

        {/* ACTIONS */}
        {(!showDiscount && !entry) ? (
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              addEntry("discount", debitCredit);
              setShowDiscount(true);
            }}
            className="cursor-pointer border-2 border-dashed border-blue-200 bg-blue-50 text-blue-600 rounded-2xl p-2 hover:bg-blue-100 transition"
          >
            + Add discount
          </button>
        ) : (
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              removeEntry(index);
              setShowDiscount(false);
            }}
            className="cursor-pointer text-red-500 hover:bg-red-50 px-3 py-2 rounded-xl transition"
          >
            <FaTrash />
          </button>
        )}
      </div>

      {/* FORM */}
      {(showDiscount || entry) && (
        <div className="bg-gray-50 border gap-4 grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 border-gray-200 rounded-2xl p-4 space-y-4">

          <SelectField
            label="Account"
            value={entry.account || ""}
            options={accounts}
            onChange={(val) =>
              updateEntry(index, "account", val as string)
            } disabled={disabled}
          />
          <InputField
            label="Percentage %"
            type="number"
            min={0}
            max={100}
            value={(
              (Number(entry.amount) * 100) /
              purchaseTotal
            ).toFixed(2)}
            onChange={(val) => {
              const amount = Math.round(
                ((Number(val) * purchaseTotal) / 100) * 100
              ) / 100;

              updateEntry(index, "amount", amount);
            }}
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
      )}

    </div>
  );
}