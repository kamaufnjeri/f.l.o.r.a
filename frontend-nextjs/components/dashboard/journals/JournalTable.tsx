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
          {/* HEADER */}
          <thead className="sticky top-0 z-10 bg-gray-50 text-gray-600">
            <tr className="border-b">
              <th className="p-3 text-left font-medium">Ref</th>
              <th className="p-3 text-left font-medium">Date</th>
              <th className="p-3 text-left font-medium">Account</th>
              <th className="p-3 text-right font-medium">Debit</th>
              <th className="p-3 text-right font-medium">Credit</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {journals.map((journal) => (
              <Fragment key={journal.id}>
                {/* JOURNAL ENTRIES */}
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
                      </>
                    )}

                    <td className="p-3 text-gray-800">
                      {entry.account_name}
                    </td>

                    <td className="p-3 text-right tabular-nums text-gray-900">
                      {entry.debit_credit === "debit"
                        ? entry.amount.toLocaleString()
                        : "—"}
                    </td>

                    <td className="p-3 text-right tabular-nums text-gray-900">
                      {entry.debit_credit === "credit"
                        ? entry.amount.toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                ))}

                {/* DESCRIPTION ROW */}
                <tr>
                  <td
                    colSpan={3}
                    className="px-3 py-2 text-xs text-gray-500 italic bg-gray-50/30"
                  >
                    {journal.description}
                  </td>
                  <td colSpan={2} />
                  <td className="text-right">
                    <Link
                      href={`journals/${journal.id}`}
                      className="
                        inline-flex
                        items-center
                        gap-2
                        text-sm
                        font-medium
                        text-primary
                        hover:text-primary-dark
                        transition
                        cursor-pointer
                        px-2 py-1
                        rounded-md
                        hover:bg-primary/5
                      "
                    >
                      <FiEye className="text-base" />
                      <span>View</span>
                    </Link>
                  </td>                
                </tr>
              </Fragment>
            ))}

            {/* TOTALS */}
            <tr className="bg-gray-100 font-semibold">
              <td colSpan={3} className="p-3 text-gray-800">
                Totals
              </td>
              <td className="p-3 text-right tabular-nums">
                {totals.debit_total.toLocaleString()}
              </td>
              <td className="p-3 text-right tabular-nums">
                {totals.credit_total.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}