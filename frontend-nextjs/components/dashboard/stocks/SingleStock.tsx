import { StockDetails } from "@/types"
import Link from "next/link"
import { FiEye } from "react-icons/fi"
import StockDropDown from "./StockDropDown";

type Props = {
    organisationId: string;
    stock: StockDetails;
    date: string;
}

export function SingleStock({ stock, organisationId, date }: Props) {
  return (
  <div className="w-full space-y-4">

  {/* CUSTOMER HEADER CARD */}
  <div className="w-full rounded-2xl border bg-white p-4 shadow-sm">
    <div className="flex items-start justify-between gap-4">

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-700">
        <span>
          <strong className="text-gray-900">Name:</strong>{" "}
          {stock.name}
        </span>

        <span>
          <strong className="text-gray-900">Email:</strong>{" "}
          {stock.unit_name || "-"}
        </span>

        <span>
          <strong className="text-gray-900">Phone:</strong>{" "}
          {stock.unit_alias || "-"}
        </span>
      </div>

      <StockDropDown
        stock={stock}
        organisationId={organisationId}
        date={date}
      />
    </div>
  </div>

  {/* TABLE CARD */}
  <div className="w-full overflow-hidden rounded-2xl border bg-white shadow-sm">
  <div className="overflow-x-auto">

    <table className="w-full min-w-[1100px] text-sm">

      <thead className="sticky top-0 z-10 bg-gray-50 text-gray-600">
        <tr className="border-b">
          <th className="p-3 text-left font-medium">No.</th>
          <th className="p-3 text-left font-medium">Date</th>
          <th className="p-3 text-left font-medium">Transaction Type</th>
          <th className="p-3 text-left font-medium">Description</th>
          <th className="p-3 text-right font-medium">Quantity ({stock.unit_alias})</th>
          <th className="p-3 text-right font-medium">Rate</th>
          <th className="p-3 text-right font-medium">Total</th>
        </tr>
      </thead>

      <tbody className="divide-y">

        {stock?.stock_summary?.entries?.map((entry, index) => (
          <tr
            key={index}
            className="hover:bg-gray-50 transition cursor-pointer"
          >
            <td className="p-3 text-gray-700">
              {entry.details?.serial_number}
            </td>

            <td className="p-3 text-gray-700">
              {entry.details.date}
            </td>

            <td className="p-3 text-gray-700">
              {entry.details.type}
            </td>

            <td className="p-3 text-gray-700">
              {entry.details.description}
            </td>

            <td className="p-3 text-right tabular-nums text-gray-900">
              {(entry.details.type === "Sales" || entry.details.type === "Purchase Return") ? "(-)" : ""}
              {entry.details.quantity}
            </td>

            <td className="p-3 text-right tabular-nums text-gray-900">
              {entry.details.rate}
            </td>

            <td className="p-3 text-right tabular-nums text-gray-900">
              {entry.details.total}
            </td>
            <td className="p-3 text-right">
              {entry.details?.url && (
                <Link
                  href={`/dashboard/${organisationId}${entry.details.url}`}
                  className="
                    inline-flex items-center gap-2
                    text-sm font-medium text-primary
                    hover:text-primary-dark
                    transition
                    px-2 py-1 rounded-md
                    hover:bg-primary/5
                  "
                >
                  <FiEye className="text-base" />
                  <span>View</span>
                </Link>
              )}
            </td>
          </tr>
        ))}

      </tbody>
    </table>
  </div>
</div>
<div className="w-full overflow-hidden rounded-2xl border bg-white shadow-sm mt-6">
  <div className="overflow-x-auto">

    <table className="w-full min-w-[700px] text-sm">

      <thead className="sticky top-0 z-10 bg-gray-50 text-gray-600">
        <tr className="border-b">
          <th className="p-3 text-left font-medium">Name</th>
          <th className="p-3 text-right font-medium">Total Quantity ({stock.unit_alias})</th>
          <th className="p-3 text-right font-medium">Total Amount</th>
        </tr>
      </thead>

      <tbody className="divide-y">

        {stock?.stock_summary?.totals && stock?.stock_summary?.totals?.map((entry, index) => (
          <tr
            key={index}
            className="hover:bg-gray-50 transition cursor-pointer"
          >
            <td className="p-3 text-gray-700">
              {entry.name}
            </td>

            <td className="p-3 text-right tabular-nums text-gray-900">
            {entry.quantity}
            </td>

            <td className="p-3 text-right tabular-nums text-gray-900">
              {entry.amount}
            </td>
            
          </tr>))}
      

      </tbody>
    </table>

  </div>
</div>
</div>
  )
}

export default SingleStock
