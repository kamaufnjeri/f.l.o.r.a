import { ReturnOverview } from "@/types";
import Link from "next/link";
import { Fragment } from "react";
import { FiEye } from "react-icons/fi";

interface Props {
  returns: ReturnOverview[];
  totals: {
    quantity: number;
    amount: number;
  };
  organisationId: string;
}

export default function ReturnTable({
  returns,
  totals,
  organisationId,
}: Props) {
  return (
    <div className="w-full overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-sm">
          {/* HEADER */}
          <thead className="sticky top-0 z-10 bg-gray-50 text-gray-600">
            <tr className="border-b">
              <th className="p-3 text-left font-medium">Purchase #</th>
              <th className="p-3 text-left font-medium">Date</th>
              <th className="p-3 text-left font-medium">Item</th>
              <th className="p-3 text-right font-medium">
                Rate
              </th>
              <th className="p-3 text-right font-medium">Quantity</th>
              <th className="p-3 text-right font-medium">
                Total
              </th>
              <th className="p-3 text-right font-medium">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {returns.map((purchaseReturn) => (
              <Fragment key={purchaseReturn.id}>
                {/* RETURN ENTRIES */}
                {purchaseReturn.return_entries.map((entry, index) => (
                  <tr
                    key={`${purchaseReturn.id}-${index}`}
                    className="hover:bg-gray-50 transition"
                  >
                    {index === 0 && (
                      <>
                        <td
                          rowSpan={purchaseReturn.return_entries.length}
                          className="align-top p-3 font-medium text-gray-900 bg-gray-50/40"
                        >
                          {purchaseReturn.details.serial_number}
                        </td>

                        <td
                          rowSpan={purchaseReturn.return_entries.length}
                          className="align-top p-3 text-gray-600 bg-gray-50/40"
                        >
                          {purchaseReturn.date}
                        </td>
                      </>
                    )}

                    <td className="p-3 text-gray-800">
                      {entry.stock_name}
                    </td>

                    <td className="p-3 text-right tabular-nums">
                      {Number(entry.return_price).toLocaleString()}
                    </td>

                    <td className="p-3 text-right tabular-nums">
                      {Number(entry.return_quantity).toLocaleString()}
                    </td>

                    <td className="p-3 text-right tabular-nums font-medium">
                      {(
                        Number(entry.return_quantity) *
                        Number(entry.return_price)
                      ).toLocaleString()}
                    </td>

                    {index === 0 && (
                      <td
                        rowSpan={purchaseReturn.return_entries.length}
                        className="align-top p-3 text-right bg-gray-50/40"
                      >
                        <Link
                          href={`/dashboard/${organisationId}${purchaseReturn.details.url}`}
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
                    )}
                  </tr>
                ))}

                {/* DESCRIPTION + SUBTOTAL */}
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-2 text-xs text-gray-500 italic bg-gray-50/30"
                  >
                    {purchaseReturn.description}
                  </td>

                  <td className="px-3 py-2 text-right font-medium">
                    {Number(
                      purchaseReturn.details.total_quantity
                    ).toLocaleString()}
                  </td>

                  <td className="px-3 py-2 text-right font-medium">
                    {Number(
                      purchaseReturn.details.total_amount
                    ).toLocaleString()}
                  </td>

                  <td />
                </tr>
              </Fragment>
            ))}

            {/* GRAND TOTAL */}
            <tr className="bg-gray-100 font-semibold">
              <td colSpan={4} className="p-3 text-gray-800">
                Grand Total
              </td>

              <td className="p-3 text-right tabular-nums">
                {totals.quantity.toLocaleString()}
              </td>

              <td className="p-3 text-right tabular-nums">
                {totals.amount.toLocaleString()}
              </td>

              <td />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}