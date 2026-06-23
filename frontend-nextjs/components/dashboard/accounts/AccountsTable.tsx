import Link from "next/link";
import { FiEye } from "react-icons/fi";
import { AccountItem as Account } from "@/types";



export default function AccountTable({
  accounts,
  totals,
}: {
  accounts: Account[];
  totals: {
    balance: number;
  };
}) {
  return (
    <div className="w-full overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-sm">
          {/* HEADER */}
          <thead className="sticky top-0 z-10 bg-gray-50 text-gray-600">
            <tr className="border-b">
              <th className="p-3 text-left font-medium">Name</th>
              <th className="p-3 text-left font-medium">Group</th>
              <th className="p-3 text-left font-medium">Category</th>
              <th className="p-3 text-left font-medium">Belongs to</th>

              <th className="p-3 text-right font-medium">Balance</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {accounts.map((account) => (
              
                <tr
                key={account.id}
                className="hover:bg-gray-50 transition"
                >
                
                <td className="p-3 text-gray-800">
                    {account.name}
                </td>

                <td className="p-3 text-gray-800">
                    {account.group}
                </td>
                <td className="p-3 text-gray-800">
                    {account.category}
                </td>
                <td className="p-3 text-gray-800">
                    {account.sub_category}
                </td>

                <td className="p-3 text-right tabular-nums text-gray-900">
                    {account.account_balance}
                </td>
                {/* DESCRIPTION ROW */}
                <td className="text-right">
                <Link
                    href={`accounts/${account.id}`}
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
                </tr>
             
            ))}

            {/* TOTALS */}
            <tr className="bg-gray-100 font-semibold">
              <td colSpan={4} className="p-3 text-gray-800">
                Totals
              </td>
              
              <td className="p-3 text-right tabular-nums">
                {totals.balance}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}