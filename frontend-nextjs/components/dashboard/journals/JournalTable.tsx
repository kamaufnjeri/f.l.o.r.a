import Link from "next/link";
import { Fragment } from "react";
import { FiEye } from "react-icons/fi";

type JournalEntry = {
  id: number;
  account_name: string;
  debit_credit: "debit" | "credit";
  amount: number;
};

type Journal = {
  id: number;
  serial_number: string;
  date: string;
  description: string;
  journal_entries: JournalEntry[];
};

export default function JournalTable({
  journals,
  totals,
}: {
  journals: Journal[];
  totals: {
    debit_total: number;
    credit_total: number;
  };
}) {
  return (
    <div className="w-full overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-sm">
         

        <thead className="sticky top-0 z-10 bg-gray-50 text-gray-600">
  <tr className="border-b">
    <th className="p-3 text-left font-medium">Ref</th>
    <th className="p-3 text-left font-medium">Date</th>
    <th className="p-3 text-left font-medium">Description</th>
    <th className="p-3 text-left font-medium">Account</th>
    <th className="p-3 text-right font-medium">Debit</th>
    <th className="p-3 text-right font-medium">Credit</th>
    <th className="p-3 text-right font-medium"></th>
  </tr>
</thead>

<tbody className="divide-y">
  {journals.map((journal) => (
    <Fragment key={journal.id}>
      {journal.journal_entries.map((entry, i) => (
        <tr
          key={entry.id}
          className="hover:bg-gray-50 transition"
        >
          {i === 0 && (
            <>
              <td
                rowSpan={journal.journal_entries.length}
                className="align-top p-3 font-medium text-gray-900 bg-gray-50/40"
              >
                {journal.serial_number}
              </td>

              <td
                rowSpan={journal.journal_entries.length}
                className="align-top p-3 text-gray-600 bg-gray-50/40"
              >
                {journal.date}
              </td>

              <td
                rowSpan={journal.journal_entries.length}
                className="align-top p-3 text-gray-500 italic bg-gray-50/20 max-w-xs"
              >
                {journal.description}
              </td>
            </>
          )}

          <td className="p-3 text-gray-800">
            {entry.account_name}
          </td>

          <td className="p-3 text-right tabular-nums">
            {entry.debit_credit === "debit"
              ? entry.amount.toLocaleString()
              : "—"}
          </td>

          <td className="p-3 text-right tabular-nums">
            {entry.debit_credit === "credit"
              ? entry.amount.toLocaleString()
              : "—"}
          </td>

          {i === 0 && (
            <td
              rowSpan={journal.journal_entries.length}
              className="align-top p-3 text-right bg-gray-50/20"
            >
              <Link
                href={`journals/${journal.id}`}
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-md
                  px-2
                  py-1
                  text-sm
                  font-medium
                  text-primary
                  hover:bg-primary/5
                "
              >
                <FiEye />
                <span>View</span>
              </Link>
            </td>
          )}
        </tr>
      ))}
    </Fragment>
  ))}

  <tr className="bg-gray-100 font-semibold">
    <td colSpan={4} className="p-3">
      Totals
    </td>

    <td className="p-3 text-right">
      {totals.debit_total.toLocaleString()}
    </td>

    <td className="p-3 text-right">
      {totals.credit_total.toLocaleString()}
    </td>

    <td />
  </tr>
</tbody>
        </table>
      </div>
    </div>
  );
}