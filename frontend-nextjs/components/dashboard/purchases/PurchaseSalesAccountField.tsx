import { JournalEntry } from "@/types";
import SelectField, { SelectOption } from "../journals/SelectField";

export type Entry = {
  entry: JournalEntry,
  index: number,
}
type Props = {
  title: string;
  entryData: Entry,
  isDirty?: boolean;
  accounts: SelectOption[];
  disabled?: boolean;
  updateEntry: <K extends keyof JournalEntry
  >(
    index: number,
    field: K,
    value: JournalEntry[K]
  ) => void;
}


export default function PurchaseSalesAccountField({
  title,
  entryData,

  accounts,
  isDirty = false,
  disabled = false,
  updateEntry
}: Props) {
  const { entry, index } = entryData;
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
            placeholder={`Choose ${title}`}
            value={entry?.account ?? "" }
            onChange={(val) =>
              updateEntry(index, "account", val as string)
            }
            disabled={disabled}
          />
        </div>
     
    </div>
  );
}