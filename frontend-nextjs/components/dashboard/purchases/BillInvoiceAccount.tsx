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
  entryData: Entry,
  dueDate: string;
  changeDueDate: (field: "due_date", value: string) => void;
  accounts: SelectOption[];
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
  return (
    <div className="bg-white rounded-3xl border shadow-sm p-6 space-y-5">


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
              removeEntry(index);
              setShowBill(false);
              changeDueDate("due_date", "");
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
            onChange={(val) => {
              changeDueDate("due_date", val);

            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <SelectField
              label="Account"
              value={entry.account || ""}
              options={accounts}
onChange={(val) =>
              updateEntry(index, "account", val as string)
            }              disabled={disabled}
            />

            <InputField
              label="Amount"
              type="number"
              value={entry.amount}
onChange={(val) =>
              updateEntry(index, "amount", Number(val))
            }              disabled={disabled}
            />

          </div>

         
        </div>
      )}

    </div>
  );
}