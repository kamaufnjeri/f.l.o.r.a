import { AccountingState, JournalEntry } from "@/types";
import SelectField, { SelectOption } from "../journals/SelectField";

type Props = {
  title: string;
  type: 'sale' | 'purchase',
  entry: JournalEntry | null,
  isDirty?: boolean;
  accounts: SelectOption[];
  disabled?: boolean;
  updateEntry: (
    section: keyof AccountingState,
    field: keyof JournalEntry,
    value: string | number) => void;
}


export default function PurchaseSalesAccountField({
  title,
  type = "purchase",
  entry,
  accounts,
  isDirty = false,
  disabled = false,
  updateEntry
}: Props) {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-5">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-gray-700">{title}</h2>

        {isDirty && <span className="text-yellow-500 text-xs">• edited</span>}
      </div>

     
        <div className="grid grid-cols-1 gap-2 p-2 rounded-md">
          <SelectField
            options={accounts}
            placeholder="Choose purchase account"
            value={entry?.account ?? "" }
            onChange={(val) =>
              updateEntry(type, "account", val)
            }
            disabled={disabled}
          />
        </div>
     
    </div>
  );
}