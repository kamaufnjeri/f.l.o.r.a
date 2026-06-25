import { capitalizeFirstLetter, normalizeWord } from "@/lib/utils";
import { PaymentOverview, PaymentTotals } from "@/types";
import Link from "next/link";
import { FiEye } from "react-icons/fi";


export default function PaymentsTable({
    organisationId,
  payments,
  totals,
}: {
    organisationId: string;
  payments: PaymentOverview[];
  totals: PaymentTotals
}) {
  return (
   <div className="w-full overflow-hidden rounded-2xl border bg-white shadow-sm">
  <div className="overflow-x-auto">
    <table className="w-full min-w-[900px] text-sm">
      <thead className="sticky top-0 z-10 bg-gray-50 text-gray-600">
        <tr className="border-b">
          <th className="p-3 text-left font-medium">
            #
          </th>
          <th className="p-3 text-left font-medium">Date</th>
          <th className="p-3 text-left font-medium">Type</th>
          <th className="p-3 text-left font-medium">Description</th>
          <th className="p-3 text-right font-medium">
            Amount Paid
          </th>
          <th className="p-3 text-right font-medium"></th>
        </tr>
      </thead>

      <tbody className="divide-y">
        {payments?.map((payment) => (
          <tr
            key={payment.id}
            className="hover:bg-gray-50 transition"
          >
           

            <td className="p-3 font-medium text-gray-900">
              {payment.details.serial_number}
            </td>

            <td className="p-3 text-gray-600">
              {payment.date}
            </td>

            <td className="p-3">
              <span className="inline-flex rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                {capitalizeFirstLetter(
                  payment.details.type
                )}
              </span>
            </td>

            <td className="p-3">
              <p className="text-gray-600 italic">
                {payment.description}
              </p>
            </td>

            <td className="p-3 text-right tabular-nums font-medium">
              {Number(
                payment.amount_paid
              ).toLocaleString()}
            </td>

            <td className="p-3 text-right">
              <Link
                href={`/dashboard/${organisationId}${payment.details.url}`}
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
            <td colSpan={5} className="p-3 text-gray-800">
              Totals
            </td>

            <td className="p-3 text-right tabular-nums">
              {Number(
                totals.amount_paid
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