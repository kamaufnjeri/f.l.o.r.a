import Link from "next/link";
import { FiEye } from "react-icons/fi";


type Supplier = {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  amount_due: string | number;
};

export default function SuppliersTable({
  suppliers,
  totals,
}: {
  suppliers: Supplier[];
  totals: {
    amount_due: number;
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
              <th className="p-3 text-left font-medium">Email</th>
              <th className="p-3 text-left font-medium">Phone No.</th>
              <th className="p-3 text-right font-medium">Amount Due</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {suppliers.map((supplier) => (
              
                <tr
                key={supplier.id}
                className="hover:bg-gray-50 transition"
                >
                
                <td className="p-3 text-gray-800">
                    {supplier.name}
                </td>

                <td className="p-3 text-gray-800">
                    {supplier.email}
                </td>
                <td className="p-3 text-gray-800">
                    {supplier.phone_number}
                </td>
               

                <td className="p-3 text-right tabular-nums text-gray-900">
                    {supplier.amount_due}
                </td>
                {/* DESCRIPTION ROW */}
                <td className="text-right">
                <Link
                    href={`suppliers/${supplier.id}`}
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
              <td colSpan={3} className="p-3 text-gray-800">
                Totals
              </td>
              
              <td className="p-3 text-right tabular-nums">
                {totals.amount_due}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}