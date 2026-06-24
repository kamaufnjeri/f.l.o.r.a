import { capitalizeFirstLetter } from "@/lib/utils";
import { SalesOverview, SalesTotal } from "@/types";
import Link from "next/link";
import { Fragment } from "react";
import { FiEye } from "react-icons/fi";


export default function SalesTable({
  sales,
  totals,
}: {
  sales: SalesOverview[];
  totals: SalesTotal
}) {
  return (
   <div className="w-full overflow-hidden rounded-2xl border bg-white shadow-sm">
  <div className="overflow-x-auto">
    <table className="w-full min-w-[900px] text-sm">
      {/* HEADER */}
      <thead className="sticky top-0 z-10 bg-gray-50 text-gray-600">
        <tr className="border-b">
          <th className="p-3 text-left font-medium">Sale #</th>
          <th className="p-3 text-left font-medium">Date</th>
          <th className="p-3 text-left font-medium">Type</th>
          <th className="p-3 text-left font-medium">Stock Items</th>
          <th className="p-3 text-right font-medium">
            Total Amount
          </th>
          <th className="p-3 text-right font-medium">Total Qty</th>
          <th className="p-3 text-right font-medium">
            Amount Due
          </th>
        </tr>
      </thead>

      <tbody className="divide-y">
        {sales?.map((sale) => (
         
            <tr
              key={sale.id}
              className="hover:bg-gray-50 transition"
            >
              <td className="p-3 font-medium text-gray-900">
                {sale.serial_number}
              </td>

              <td className="p-3 text-gray-600">
                {sale.date}
              </td>

              <td className="p-3">
                <span className="inline-flex rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                  {capitalizeFirstLetter(sale.details.type)}
                </span>
              </td>

              <td className="p-3 flex flex-col items-start">
                <div className="flex flex-wrap gap-1">
                  {sale.details.items.map((item, index) => (
                    <span
                      key={index}
                      className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700"
                    >
                      {item}
                    </span>
                  ))}

                </div>
                <i className="text-sm">({sale.description})</i>

              </td>

              <td className="p-3 text-right tabular-nums font-medium">
                {Number(sale.details.total_amount).toLocaleString()}
              </td>

              <td className="p-3 text-right tabular-nums">
                {Number(sale.details.total_quantity).toLocaleString()}
              </td>

              <td className="p-3 text-right tabular-nums">
                {Number(sale.details.amount_due) > 0
                  ? Number(sale.details.amount_due).toLocaleString()
                  : "—"}
              </td>
              

              <td className="bg-gray-50/40 text-right pr-3">
                <Link
                  href={`sales/${sale.id}`}
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

        {/* TOTALS */}
        {totals && (
          <tr className="bg-gray-100 font-semibold">
            <td colSpan={4} className="p-3 text-gray-800">
              Totals
            </td>

            <td className="p-3 text-right tabular-nums">
              {Number(
                totals.amount
              ).toLocaleString()}
            </td>

            <td className="p-3 text-right tabular-nums">
              {Number(
                totals.quantity
              ).toLocaleString()}
            </td>

            <td className="p-3 text-right tabular-nums">
              {Number(
                totals.amount_due
              ).toLocaleString()}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>
  );
}