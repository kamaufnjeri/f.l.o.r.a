import { CustomerDetails } from "@/types"
import Link from "next/link"
import { FiEye } from "react-icons/fi"
import CustomerDropDown from "./CustomerDropDown";
import { normalizeWord } from "@/lib/utils";

type Props = {
    organisationId: string;
    customer: CustomerDetails;
    date: string;
}

export function SingleCustomer({ customer, organisationId, date }: Props) {
  return (
  <div className="w-full space-y-4">

  {/* CUSTOMER HEADER CARD */}
  <div className="w-full rounded-2xl border bg-white p-4 shadow-sm">
    <div className="flex items-start justify-between gap-4">

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-700">
        <span>
          <strong className="text-gray-900">Name:</strong>{" "}
          {customer.name}
        </span>

        <span>
          <strong className="text-gray-900">Email:</strong>{" "}
          {customer.email || "-"}
        </span>

        <span>
          <strong className="text-gray-900">Phone:</strong>{" "}
          {customer.phone_number || "-"}
        </span>
      </div>

      <CustomerDropDown
        customer={customer}
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
            <th className="p-3 text-left font-medium">Serial No.</th>
            <th className="p-3 text-left font-medium">Date</th>
            <th className="p-3 text-left font-medium">Type</th>
            <th className="p-3 text-left font-medium">Description</th>
            <th className="p-3 text-left font-medium">Due Date</th>
            <th className="p-3 text-left font-medium">Status</th>
            <th className="p-3 text-right font-medium">Paid</th>
            <th className="p-3 text-right font-medium">Due</th>
            <th className="p-3 text-right font-medium">Action</th>
          </tr>
        </thead>

        <tbody className="divide-y">

          {customer.customer_data?.invoices.map((invoice, index) => (
            <tr
              key={index}
              className="hover:bg-gray-50 transition"
            >
             <td className="p-3 text-gray-700">
                {invoice.details.serial_number}
              </td>

              <td className="p-3 text-gray-700">
                {invoice.details.date}
              </td>

              <td className="p-3 text-gray-700">
                {invoice.details.type}
              </td>

              

              <td className="p-3 text-gray-700">
                {invoice.details.description}
              </td>

              <td className="p-3 text-gray-700">
                {invoice.due_date}
              </td>

              <td className="p-3">
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                    invoice.status === "debit"
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {normalizeWord(invoice.status)}
                </span>
              </td>

              <td className="p-3 text-right tabular-nums text-gray-900">
                {invoice.amount_paid}
              </td>

              <td className="p-3 text-right tabular-nums text-gray-900">
                {invoice.amount_due}
              </td>

              <td className="p-3 text-right">
                {invoice.details.url && (
                  <Link
                    href={`/dashboard/${organisationId}${invoice.details.url}`}
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
                )}
              </td>
            </tr>
          ))}

          {/* TOTALS */}
          {customer.customer_data?.totals && (
            <tr className="bg-gray-100 font-semibold">
              <td colSpan={7} className="p-3 text-gray-800">
                Totals
              </td>

              <td className="p-3 text-right tabular-nums">
                {customer.customer_data.totals.amount_paid}
              </td>

              <td className="p-3 text-right tabular-nums">
                {customer.customer_data.totals.amount_due}
              </td>

              <td />
            </tr>
          )}

        </tbody>
      </table>
    </div>
  </div>
</div>
  )
}

export default SingleCustomer
