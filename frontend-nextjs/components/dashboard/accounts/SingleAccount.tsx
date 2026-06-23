import { AccountDetails } from "@/types"
import Link from "next/link"
import { FiEye } from "react-icons/fi"
import AccountDropDown from "./AccountDropDown";

type Props = {
    organisationId: string;
    account: AccountDetails;
    date: string;
}

export function SingleAccount({ account, organisationId, date }: Props) {
  return (
  <div className="w-full space-y-4">
  {/* ACCOUNT HEADER CARD */}
  <div className="w-full rounded-2xl border bg-white p-4 shadow-sm">


    <div className="flex items-start justify-between gap-4">
    <div className="mt-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm text-gray-700">
      <span><strong className="text-gray-900">Name:</strong> {account.name}</span>
      <span><strong className="text-gray-900">Group:</strong> {account.group}</span>
      <span><strong className="text-gray-900">Category:</strong> {account.category}</span>
      <span><strong className="text-gray-900">Sub Category:</strong> {account.sub_category}</span>
    </div>
  
  <AccountDropDown
    account={account}
    organisationId={organisationId}
    date={date}
  />
</div>
  </div>

  {/* TABLE CARD (NEW DESIGN) */}
  <div className="w-full overflow-hidden rounded-2xl border bg-white shadow-sm">
    <div className="overflow-x-auto">

      <table className="w-full min-w-[900px] text-sm">

        {/* HEADER */}
        <thead className="sticky top-0 z-10 bg-gray-50 text-gray-600">
          <tr className="border-b">
            <th className="p-3 text-left font-medium">Serial No.</th>
            <th className="p-3 text-left font-medium">Date</th>
            <th className="p-3 text-left font-medium">Type</th>
            <th className="p-3 text-left font-medium" colSpan={2}>Details</th>
            <th className="p-3 text-right font-medium">Debit</th>
            <th className="p-3 text-right font-medium">Credit </th>
          </tr>
        </thead>

        {/* BODY */}
        <tbody className="divide-y">

          {account?.account_data?.entries.map((entry, index) => (
            <tr
              key={index}
              className="hover:bg-gray-50 transition cursor-pointer"
            >
              <td className="p-3 text-gray-700">{entry.details.serial_number}</td>

              <td className="p-3 text-gray-700">{entry.details.date}</td>

              <td className="p-3 text-gray-700">{entry.details.type}</td>

              <td className="p-3 text-gray-700" colSpan={2}>
                {entry.details.description}
              </td>

              <td className="p-3 text-right tabular-nums text-gray-900">
                {entry.debit_credit === "debit" ? entry.amount : "-"}
              </td>

              <td className="p-3 text-right tabular-nums text-gray-900">
                {entry.debit_credit === "credit" ? entry.amount : "-"}
              </td>
               <td className="text-right">
                {entry.details.url && <Link
                    href={`/dashboard/${organisationId}${entry.details.url}`}
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
                </Link>}
                </td>
            </tr>
          ))}

          {/* TOTALS */}
          {account.account_data?.totals && (
            <>
              <tr className="bg-gray-100 font-semibold">
                <td className="p-3 text-gray-800" colSpan={5}>
                  Total
                </td>
                <td className="p-3 text-right tabular-nums">
                  {account.account_data.totals.debit}
                </td>
                <td className="p-3 text-right tabular-nums">
                  {account.account_data.totals.credit}
                </td>
              </tr>

              <tr className="bg-blue-50 font-semibold">
                <td className="p-3 text-gray-800" colSpan={5}>
                  Balance
                </td>

                {account.account_data.totals.closing.debit_credit === "debit" ? (
                  <>
                    <td className="p-3 text-right tabular-nums text-gray-900">
                      {account.account_data.totals.closing.amount}
                    </td>
                    <td className="p-3 text-right">-</td>
                  </>
                ) : (
                  <>
                    <td className="p-3 text-right">-</td>
                    <td className="p-3 text-right tabular-nums text-gray-900">
                      {account.account_data.totals.closing.amount}
                    </td>
                  </>
                )}
              </tr>
            </>
          )}

        </tbody>
      </table>
    </div>
  </div>
</div>
  )
}

export default SingleAccount
