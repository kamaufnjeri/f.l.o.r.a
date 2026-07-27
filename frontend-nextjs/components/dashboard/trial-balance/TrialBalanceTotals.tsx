"use client";

import { formatAmount } from "@/lib/utils";

type Props = {
  totals: {
    debit: number;
    credit: number;
  };
};

export default function TrialBalanceTotals({ totals }: Props) {
  const difference = Math.abs(totals.debit - totals.credit);
  const balanced = difference === 0;

  return (
      <tfoot>

            <tr className="border-t-2 bg-gray-100 font-semibold">

              <td className="p-4">
                Total
              </td>


              <td className="p-3 text-right tabular-nums text-green-700">

                {formatAmount(totals.debit)}

              </td>


        <td className="p-3 text-right tabular-nums text-red-700">

                {formatAmount(totals.credit)}

              </td>


              <td className="p-4 text-right">

                {balanced ? (

                  <span
                    className="
                    rounded-full
                    bg-green-100
                    px-3
                    py-1
                    text-xs
                    text-green-700
                    "
                  >
                    Balanced ✓
                  </span>

                ) : (

                  <span
                    className="
                    rounded-full
                    bg-red-100
                    px-3
                    py-1
                    text-xs
                    text-red-700
                    "
                  >
                    Difference {formatAmount(difference)}
                  </span>

                )}

              </td>

            </tr>

          </tfoot>

  );
}