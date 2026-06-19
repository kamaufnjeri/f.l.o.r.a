import { useState } from "react";
import { AccountingState, DebitCredit, JournalEntry } from "@/types";
import InputField from "../journals/InputField";
import SelectField, { SelectOption } from "../journals/SelectField";
import { FaTrash } from "react-icons/fa";

type Props = {
  debitCredit: DebitCredit;
  entry: JournalEntry | null;
  purchaseTotal: number;
  accounts: SelectOption[];
  disabled?: boolean;
  updateEntry: (
    section: keyof AccountingState,
    field: keyof JournalEntry,
    value: string | number
  ) => void;
  addEntry: (
    section: keyof AccountingState,
    debitCredit: DebitCredit
  ) => void;
  removeEntry: (section: keyof AccountingState) => void;
};

export default function DiscountAccountField({
  debitCredit,
  entry,
  purchaseTotal,
  accounts,
  disabled = false,
  updateEntry,
  addEntry,
  removeEntry,
}: Props) {
  const [showDiscount, setShowDiscount] = useState(false);

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-5">
      

      {!showDiscount || !entry ? (
        <div className="flex flex-wrap justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
        Discount
      </h2>
        <button
          type="button"
          onClick={() => {
            addEntry("discount", debitCredit);
            setShowDiscount(true);
          }}
          className="cursor-pointer border-2 border-dashed border-blue-200 bg-blue-50 text-blue-600 rounded-2xl p-2 hover:bg-blue-100 transition"
        >
          + Add Discount
        </button>
        </div>
      ) : (
        <div className="bg-gray-50 border gap-4 grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 border-gray-200 rounded-2xl p-4 space-y-4">
                             <div className="flex flex-wrap justify-between md:col-span-2 lg:col-span-3">

          <h2 className="text-lg font-semibold text-gray-900">
            Discount
          </h2>
           <button
            type="button"
            onClick={() => {
              removeEntry("discount");
              setShowDiscount(false);
            }}
            className="cursor-pointer text-red-500 hover:bg-red-50 px-3 py-2 rounded-xl transition"
          >
            <FaTrash/>
          </button>
          </div>
          <SelectField
            label="Account"
            value={entry.account || ""}
            options={accounts}
            onChange={(val) => updateEntry("discount", "account", val)}
            disabled={disabled}
          />
  <InputField
            label="Percentage %"
            type="number"
            value={(Number(entry.amount) * 100) / purchaseTotal}
            onChange={(val) => {
              const amount = (Number(val) * purchaseTotal) / 100;
              updateEntry("discount", "amount", amount);
            }}
          />
          
         
          <InputField
            label="Amount"
            type="number"
            value={entry.amount}
            onChange={(val) =>
              updateEntry("discount", "amount", val)
            }
          />
           
          
         

        </div>
      )}

    </div>
  );
}