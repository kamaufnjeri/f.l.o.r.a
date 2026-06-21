import Link from "next/link";
import { FiEye } from "react-icons/fi";


type Stock = {
  id: number;
  name: string;
  unit_name: string;
  unit_alias: string;
  total_quantity: string | number;
};

export default function StocksTable({
  stocks,
  totals,
}: {
  stocks: Stock[];
  totals: {
    quantity: number;
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
              <th className="p-3 text-left font-medium">Unit Name</th>
              <th className="p-3 text-left font-medium">Unit Alias</th>
              <th className="p-3 text-right font-medium">Quantity</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {stocks.map((stock) => (
              
                <tr
                key={stock.id}
                className="hover:bg-gray-50 transition"
                >
                
                <td className="p-3 text-gray-800">
                    {stock.name}
                </td>

                <td className="p-3 text-gray-800">
                    {stock.unit_name}
                </td>
                <td className="p-3 text-gray-800">
                    {stock.unit_alias}
                </td>
               

                <td className="p-3 text-right tabular-nums text-gray-900">
                    {stock.total_quantity}
                </td>
                {/* DESCRIPTION ROW */}
                <td className="text-right">
                <Link
                    href={`stocks/${stock.id}`}
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
                {totals.quantity}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}