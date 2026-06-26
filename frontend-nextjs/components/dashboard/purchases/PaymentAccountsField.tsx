import { DebitCredit, JournalEntry, JournalType } from "@/types";
import InputField from "../journals/InputField";
import SelectField, { SelectOption } from "../journals/SelectField";
import { FaTrash } from "react-icons/fa";
import { Entry } from "./PurchaseSalesAccountField";

type Props = {
  debitCredit: DebitCredit;
  entriesData: Entry[];
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

export default function PaymentAccountsField({
  debitCredit,
  entriesData,
  accounts,
  isDirty = false,
  disabled = false,
  updateEntry,
  addEntry,
  removeEntry,
}: Props) {
  return (
    <div className="bg-white rounded-3xl border shadow-sm p-6 space-y-5">

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">
          Payment Accounts
        </h2>
 {isDirty && (
            <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
              edited
            </span>
          )}
        <button
          type="button"
                    disabled={disabled}

          onClick={() => addEntry("payment", debitCredit)}
          className="cursor-pointer px-4 py-2 rounded-xl bg-gray-700 text-white text-sm hover:bg-gray-800 transition"
        >
          + Add
        </button>
      </div>

      <div className="space-y-3">

        {entriesData.map(({entry, index}) => (
          <div
            key={index}
            className="grid grid-cols-1 md:grid-cols-[2fr_1fr_auto] gap-4 items-end bg-gray-50 border border-gray-200 rounded-2xl p-4"
          >

            <SelectField
              label="Account"
              value={entry?.account || ""}
              options={accounts}
              onChange={(val) =>
                updateEntry(index, "account", val as string)
              }
              disabled={disabled}
            />

            <InputField
              label="Amount"
              type="number"
              value={entry?.amount}
              onChange={(val) =>
                updateEntry(index, "amount", Number(val))
              }
              disabled={disabled}
            />

            {!disabled && (
              <button
                type="button"
                onClick={() => removeEntry(index)}
                className="cursor-pointer text-red-500 hover:bg-red-50 px-3 py-2 rounded-xl transition"
              >
                <FaTrash/>
              </button>
            )}

          </div>
        ))}

      </div>

    </div>
  );
}