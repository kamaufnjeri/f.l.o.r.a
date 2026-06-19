import { AccountingState, DebitCredit, JournalEntry } from "@/types";
import InputField from "../journals/InputField";
import SelectField, { SelectOption } from "../journals/SelectField";
import { FaTrash } from "react-icons/fa";

type Props = {
  debitCredit: DebitCredit;
  entries: JournalEntry[];
  accounts: SelectOption[];
  disabled?: boolean;
  updateEntry: (
    section: keyof AccountingState,
    field: keyof JournalEntry,
    value: string | number,
    index: number
  ) => void;
  addEntry: (
    section: keyof AccountingState,
    debitCredit: DebitCredit
  ) => void;
  removeEntry: (section: keyof AccountingState, index?: number) => void;
};

export default function PaymentAccountsField({
  debitCredit,
  entries,
  accounts,
  disabled = false,
  updateEntry,
  addEntry,
  removeEntry,
}: Props) {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-5">

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">
          Payment Accounts
        </h2>

        <button
          type="button"
          onClick={() => addEntry("payment", debitCredit)}
          className="cursor-pointer px-4 py-2 rounded-xl bg-gray-700 text-white text-sm hover:bg-gray-800 transition"
        >
          + Add
        </button>
      </div>

      <div className="space-y-3">

        {entries.map((item, i) => (
          <div
            key={i}
            className="grid grid-cols-1 md:grid-cols-[2fr_1fr_auto] gap-4 items-end bg-gray-50 border border-gray-200 rounded-2xl p-4"
          >

            <SelectField
              label="Account"
              value={item.account || ""}
              options={accounts}
              onChange={(val) =>
                updateEntry("payment", "account", val, i)
              }
              disabled={disabled}
            />

            <InputField
              label="Amount"
              type="number"
              value={item.amount}
              onChange={(val) =>
                updateEntry("payment", "amount", val, i)
              }
              disabled={disabled}
            />

            {!disabled && (
              <button
                type="button"
                onClick={() => removeEntry("payment", i)}
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