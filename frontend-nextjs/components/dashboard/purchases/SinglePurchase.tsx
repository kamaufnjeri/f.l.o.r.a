import { PurchaseDetail } from "@/types/purchases";
import PurchaseDropDown from "./PurchaseDropDown";
import { normalizeWord } from "@/lib/utils";
import PurchaseHeader from "./PurchaseHeader";

type Props = {
  organisationId: string;
  purchase: PurchaseDetail;
};

export default function SinglePurchase({
  purchase,
  organisationId,
}: Props) {
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b bg-gradient-to-r from-slate-50 to-white p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <PurchaseHeader title='Purchase' serialNumber={purchase.serial_number} description={purchase.description}/>
            <div className="flex justify-start lg:justify-end">
              <PurchaseDropDown
                purchase={purchase}
                organisationId={organisationId}
              />
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Date
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              {purchase.date}
            </p>
          </div>

          <div className="rounded-2xl border bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Type
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              {normalizeWord(purchase.details.type)}
            </p>
          </div>

          <div className="rounded-2xl border bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Total Quantity
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              {purchase.details.total_quantity}
            </p>
          </div>

          <div className="rounded-2xl border bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Total Amount
            </p>
            <p className="mt-2 text-lg font-semibold text-emerald-600">
              {purchase.details.total_amount}
            </p>
          </div>
        </div>

        {purchase.bill && (
          <div className="border-t p-6">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Bill Information
            </h3>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs text-slate-500">Customer</p>
                <p className="font-medium text-slate-900">
                  {purchase.bill.customer_name}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Status</p>
                <span
                  className={`
                    inline-flex rounded-full px-3 py-1 text-xs font-medium
                    ${
                      purchase.bill.status === "paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }
                  `}
                >
                  {normalizeWord(purchase.bill.status)}
                </span>
              </div>

              {purchase.bill.amount_due > 0 && (
                <>
                  <div>
                    <p className="text-xs text-slate-500">Due Date</p>
                    <p className="font-medium text-slate-900">
                      {purchase.bill.due_date}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">Amount Due</p>
                    <p className="font-semibold text-red-600">
                      {purchase.bill.amount_due}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b px-6 py-4">
          <h2 className="font-semibold text-slate-900">
            Purchase Items
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 text-sm text-slate-600">
                <th className="px-6 py-4 text-left font-semibold">#</th>
                <th className="px-6 py-4 text-left font-semibold">
                  Item
                </th>
                <th className="px-6 py-4 text-right font-semibold">
                  Rate
                </th>
                <th className="px-6 py-4 text-right font-semibold">
                  Qty
                </th>
                <th className="px-6 py-4 text-right font-semibold">
                  Total
                </th>
              </tr>
            </thead>

            <tbody>
              {purchase.purchase_entries?.map((entry, index) => (
                <tr
                  key={index}
                  className="
                    border-t
                    transition-colors
                    hover:bg-slate-50
                  "
                >
                  <td className="px-6 py-4 text-slate-500">
                    {index + 1}
                  </td>

                  <td className="px-6 py-4 font-medium text-slate-900">
                    {entry.stock_name}
                  </td>

                  <td className="px-6 py-4 text-right tabular-nums">
                    {entry.purchase_price}
                  </td>

                  <td className="px-6 py-4 text-right tabular-nums">
                    {entry.quantity}
                  </td>

                  <td className="px-6 py-4 text-right font-medium tabular-nums">
                    {entry.total_purchase_price}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* SUMMARY */}
        <div className="border-t bg-slate-50">
          <div className="flex flex-col gap-6 p-6 lg:flex-row lg:justify-between">
            <div className="max-w-xl">
              <p className="text-sm text-slate-500">
                Description
              </p>

              <p className="mt-2 text-slate-800">
                {purchase.description}
              </p>
            </div>

            <div className="w-full max-w-md space-y-2">
              <div className="flex justify-between rounded-xl bg-white p-3">
                <span>Total Quantity</span>
                <span className="font-semibold">
                  {purchase.details.total_quantity}
                </span>
              </div>

              <div className="flex justify-between rounded-xl bg-white p-3">
                <span>Total Amount</span>
                <span className="font-semibold">
                  {purchase.details.total_amount}
                </span>
              </div>

              {purchase.details.footer_data &&
                Object.entries(purchase.details.footer_data).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className={`
                        flex justify-between rounded-xl p-3
                        ${
                          key === "Amount Due"
                            ? "bg-red-50 text-red-600"
                            : "bg-white"
                        }
                        ${
                          key === "Total"
                            ? "bg-emerald-50 font-semibold"
                            : ""
                        }
                      `}
                    >
                      <span>{key}</span>
                      <span>{value}</span>
                    </div>
                  )
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}