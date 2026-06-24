"use client";

import { JournalTotals } from "@/types/sales";
import Modal from "../common/Modal";
import ModalHeader from "../common/ModalHeader";
import { JournalEntry } from "@/types/purchases";


type Props = {
  open: boolean;
  onClose: () => void;
  journalEntries: JournalEntry[];
  journalTotals: JournalTotals
};

export default function JournalEntriesModal({
  open,
  onClose,
  journalEntries,
  journalTotals
}: Props) {
  

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col">
        <div className="sticky top-0 z-10 bg-white">
          <ModalHeader
            title="Journal Entries"
            description="Double-entry accounting records"
            onClose={onClose}
          />
        </div>

        <div className="overflow-y-auto p-5">
          {/* SUMMARY */}
          <div className="mb-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border bg-emerald-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">
                Total Debit
              </p>

              <p className="mt-2 text-2xl font-bold text-emerald-700">
                {journalTotals.debit_total}
              </p>
            </div>

            <div className="rounded-2xl border bg-blue-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
                Total Credit
              </p>

              <p className="mt-2 text-2xl font-bold text-blue-700">
                {journalTotals.credit_total}
              </p>
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-hidden rounded-2xl border bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px]">
                <thead>
                  <tr className="bg-slate-50 text-sm text-slate-600">
                    <th className="px-4 py-3 text-left font-semibold">
                      Account
                    </th>

                    <th className="px-4 py-3 text-right font-semibold">
                      Debit
                    </th>

                    <th className="px-4 py-3 text-right font-semibold">
                      Credit
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {journalEntries.map((entry, index) => (
                    <tr
                      key={index}
                      className="border-t hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {entry.account_name}
                      </td>

                      <td className="px-4 py-3 text-right tabular-nums text-emerald-600">
                        {entry.debit_credit === "debit" ? entry.amount: "-"}
                      </td>

                      <td className="px-4 py-3 text-right tabular-nums text-blue-600">
                        {entry.debit_credit === "credit" ? entry.amount: "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>

                <tfoot>
                  <tr className="border-t-2 bg-slate-100 font-semibold">
                    <td className="px-4 py-3">Total</td>

                    <td className="px-4 py-3 text-right text-emerald-700">
                      {journalTotals.debit_total}
                    </td>

                    <td className="px-4 py-3 text-right text-blue-700">
                      {journalTotals.credit_total}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {journalEntries.length === 0 && (
            <div className="rounded-2xl border border-dashed p-10 text-center text-gray-500">
              No journal entries available.
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}