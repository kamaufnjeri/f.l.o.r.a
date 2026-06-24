import { capitalizeFirstLetter, normalizeWord } from "@/lib/utils";
import { InvoiceOverview, BillInvoiceTotals } from "@/types";
import Link from "next/link";
import { FiEye } from "react-icons/fi";


export default function InvoicesTable({
    organisationId,
  invoices,
  totals,
}: {
    organisationId: string;
  invoices: InvoiceOverview[];
  totals: BillInvoiceTotals
}) {
  return (
   <div className="w-full overflow-hidden rounded-2xl border bg-white shadow-sm">
  <div className="overflow-x-auto">
    <table className="w-full min-w-[1100px] text-sm">
      <thead className="sticky top-0 z-10 bg-gray-50 text-gray-600">
        <tr className="border-b">
          <th className="p-3 text-left font-medium">#</th>
          <th className="p-3 text-left font-medium">Date</th>
          <th className="p-3 text-left font-medium">Due Date</th>
          <th className="p-3 text-left font-medium">Supplier</th>
          <th className="p-3 text-left font-medium">Status</th>
          <th className="p-3 text-left font-medium">Due Days</th>
          <th className="p-3 text-left font-medium">Type</th>
          <th className="p-3 text-right font-medium">
            Amount Paid
          </th>
          <th className="p-3 text-right font-medium">
            Amount Due
          </th>
          <th className="p-3 text-right font-medium"></th>
        </tr>
      </thead>

      <tbody className="divide-y">
        {invoices?.map((invoice) => (
          <tr
            key={invoice.id}
            className="hover:bg-gray-50 transition"
          >
            <td className="p-3 font-medium text-gray-900">
              {invoice.details.serial_number}
            </td>

            <td className="p-3 text-gray-600">
              {invoice.details.date}
            </td>

            <td className="p-3 text-gray-600">
              {invoice.due_date}
            </td>

            <td className="p-3">
              {invoice.customer_name}
            </td>

            <td className="p-3">
              <span
                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium
                  ${
                    invoice.status === "paid"
                      ? "bg-green-50 text-green-700"
                      : invoice.status === "partially_paid"
                      ? "bg-yellow-50 text-yellow-700"
                      : "bg-red-50 text-red-700"
                  }
                `}
              >
                {normalizeWord(invoice.status)}
              </span>
            </td>

            <td className="p-3 text-gray-600">
              {invoice.details.due_days}
            </td>

            <td className="p-3">
              <span className="inline-flex rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                {capitalizeFirstLetter(
                  invoice.details.type
                )}
              </span>
            </td>

            <td className="p-3 text-right tabular-nums font-medium">
              {Number(
                invoice.amount_paid
              ).toLocaleString()}
            </td>

            <td className="p-3 text-right tabular-nums">
              {Number(
                invoice.amount_due
              ).toLocaleString()}
            </td>

            <td className="p-3 text-right">
              <Link
                href={`/dasboard/${organisationId}${invoice.details.url}`}
                className="
                  inline-flex
                  items-center
                  gap-2
                  text-sm
                  font-medium
                  text-primary
                  hover:text-primary-dark
                  transition
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
        ))}

        {totals && (
          <tr className="bg-gray-100 font-semibold">
            <td colSpan={7} className="p-3 text-gray-800">
              Totals
            </td>

            <td className="p-3 text-right tabular-nums">
              {Number(
                totals.amount_paid
              ).toLocaleString()}
            </td>

            <td className="p-3 text-right tabular-nums">
              {Number(
                totals.amount_due
              ).toLocaleString()}
            </td>

            <td />
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>
  );
}