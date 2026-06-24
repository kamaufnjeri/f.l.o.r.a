import { ServiceIncomeDetail } from "@/types/service-income";
import ServiceIncomeDropDown from "./ServiceIncomeDropDown";
import { normalizeWord } from "@/lib/utils";

type Props = {
  organisationId: string;
  serviceIncome: ServiceIncomeDetail;
};

export default function SingleServiceIncome({
  serviceIncome,
  organisationId,
}: Props) {
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b bg-gradient-to-r from-slate-50 to-white p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Service Income #{serviceIncome.serial_number}
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                {serviceIncome.description ||
                  "Service income transaction details"}
              </p>
            </div>

            <ServiceIncomeDropDown
              organisationId={organisationId}
              serviceIncome={serviceIncome}
            />
          </div>
        </div>

        {/* STATS */}
        <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Date
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              {serviceIncome.date}
            </p>
          </div>

          <div className="rounded-2xl border bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Type
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              {normalizeWord(serviceIncome.details.type)}
            </p>
          </div>

          <div className="rounded-2xl border bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Total Quantity
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              {serviceIncome.details.total_quantity}
            </p>
          </div>

          <div className="rounded-2xl border bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Total Amount
            </p>
            <p className="mt-2 text-lg font-semibold text-emerald-600">
              {serviceIncome.details.total_amount}
            </p>
          </div>
        </div>

        {serviceIncome.invoice && (
          <div className="border-t p-6">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Invoice Information
            </h3>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs text-slate-500">
                  Customer
                </p>
                <p className="font-medium text-slate-900">
                  {serviceIncome.invoice.customer_name}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Status
                </p>

                <span
                  className={`
                    inline-flex rounded-full px-3 py-1 text-xs font-medium
                    ${
                      serviceIncome.invoice.status ===
                      "paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }
                  `}
                >
                  {normalizeWord(
                    serviceIncome.invoice.status
                  )}
                </span>
              </div>

              {serviceIncome.invoice.amount_due > 0 && (
                <>
                  <div>
                    <p className="text-xs text-slate-500">
                      Due Date
                    </p>
                    <p className="font-medium text-slate-900">
                      {serviceIncome.invoice.due_date}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Amount Due
                    </p>
                    <p className="font-semibold text-red-600">
                      {serviceIncome.invoice.amount_due}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* SERVICES TABLE */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b px-6 py-4">
          <h2 className="font-semibold text-slate-900">
            Services
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 text-sm text-slate-600">
                <th className="px-6 py-4 text-left">#</th>
                <th className="px-6 py-4 text-left">
                  Service
                </th>
                <th className="px-6 py-4 text-right">
                  Rate
                </th>
                <th className="px-6 py-4 text-right">
                  Qty
                </th>
                <th className="px-6 py-4 text-right">
                  Total
                </th>
              </tr>
            </thead>

            <tbody>
              {serviceIncome.service_income_entries.map(
                (entry, index) => (
                  <tr
                    key={index}
                    className="border-t hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      {index + 1}
                    </td>

                    <td className="px-6 py-4 font-medium">
                      {entry.service_name}
                    </td>

                    <td className="px-6 py-4 text-right">
                      {entry.price}
                    </td>

                    <td className="px-6 py-4 text-right">
                      {entry.quantity}
                    </td>

                    <td className="px-6 py-4 text-right font-medium">
                      {entry.service_income_total}
                    </td>
                  </tr>
                )
              )}
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
                {serviceIncome.description}
              </p>
            </div>

            <div className="w-full max-w-md space-y-2">
              <div className="flex justify-between rounded-xl bg-white p-3">
                <span>Total Quantity</span>
                <span className="font-semibold">
                  {serviceIncome.details.total_quantity}
                </span>
              </div>

              <div className="flex justify-between rounded-xl bg-white p-3">
                <span>Total Amount</span>
                <span className="font-semibold">
                  {serviceIncome.details.total_amount}
                </span>
              </div>

              {serviceIncome.details.footer_data &&
                Object.entries(
                  serviceIncome.details.footer_data
                ).map(([key, value]) => (
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
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}