import { useState } from "react";
import { AccountingState, DebitCredit, JournalEntry } from "@/types";
import InputField from "../journals/InputField";
import SelectField, { SelectOption } from "../journals/SelectField";
import { FaTrash } from "react-icons/fa";
import { capitalizeFirstLetter } from "@/lib/utils";

type Props = {
  debitCredit: DebitCredit;
  type: "bill" | "invoice";
  entry: JournalEntry | null;
  dueDate: string;
  setDueDate: React.Dispatch<React.SetStateAction<string>>;
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

export default function BillInvoiveAccountField({
  debitCredit,
  type,
  entry,
  dueDate,
  setDueDate,
  accounts,
  disabled = false,
  updateEntry,
  addEntry,
  removeEntry,
}: Props) {
  const [showBill, setShowBill] = useState(false);

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-5">


      {!showBill || !entry ? (
         <div className="flex flex-wrap justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {capitalizeFirstLetter(type)}
      </h2>
        <button
          type="button"
          onClick={() => {
            addEntry(type, debitCredit);
            setShowBill(true);
          }}
          className="cursor-pointer border-2 border-dashed border-blue-200 bg-blue-50 text-blue-600 rounded-2xl p-2 hover:bg-blue-100 transition"
        >
          + Add {capitalizeFirstLetter(type)}

        </button>
        </div>
        
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-4">
                   <div className="flex flex-wrap justify-between">

 <h2 className="text-lg font-semibold text-gray-900">
                    {capitalizeFirstLetter(type)}      </h2>
 <button
            type="button"
            onClick={() => {
              removeEntry(type);
              setShowBill(false);
              setDueDate("");
            }}
            className="cursor-pointer text-red-500 hover:bg-red-50 px-3 py-2 rounded-xl transition"
          >
            <FaTrash/>
          </button>

                    </div>

          <InputField
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={setDueDate}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <SelectField
              label="Account"
              value={entry.account || ""}
              options={accounts}
              onChange={(val) => updateEntry(type, "account", val)}
              disabled={disabled}
            />

            <InputField
              label="Amount"
              type="number"
              value={entry.amount}
              onChange={(val) => updateEntry(type, "amount", val)}
              disabled={disabled}
            />

          </div>

         
        </div>
      )}

    </div>
  );
}