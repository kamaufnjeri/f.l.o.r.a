'use client'

import { Return, ReturnTotals } from "@/types/returns";
import { Fragment, useState } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import ConfirmModal from "../common/ConfirmationModal";
import ReturnModal from "./ReturnModal";
import { deleteReturn } from "@/app/actions/returns-actions";
import toast from "react-hot-toast";
import JournalEntriesModal from "../sales/JournalEntriesModal";


function PurchaseSalesReturns( {  organisationId,
  returns,
  totals,
  type = 'purchases',
  purchaseId,
  salesId,
}: {
    organisationId: string;
  returns: Return[];
  totals: ReturnTotals;
  type: "purchases" | "sales";
  purchaseId?: string;
  salesId?: string;
}) {
  const [openReturn, setOpenReturn] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [stocks, setStocks] = useState<{ id: string; name: string}[] | null>(null);
  const [selected, setSelected] = useState<Return | null>(null);
  const [openJournalEntries, setOpenJournalEntries] = useState(false);
  const revalidateUrl = `{type}/${purchaseId ?? salesId}/returns`;


const selectReturn = (returnItem: Return) => {
  setSelected(returnItem);
  if (returnItem.details.stocks) {
    setStocks(returnItem?.details?.stocks);
  }
};

const handleDelete = async () => {
    try {
      if (!selected || !selected?.id) {
        toast.error('No return selected')
      }

      const res = await deleteReturn(
        organisationId,
        selected?.id as string,
        type,
        revalidateUrl
      );

      if (res.success) {
        toast.success('Return deleted');

        
      } else {
        toast.error(
          res.error || 'Failed to delete'
        );
      }
    } catch (error) {
      console.error(error);

      toast.error('Failed to delete');
    }
  };


  return (
   <div className="w-full overflow-hidden rounded-2xl border bg-white shadow-sm">
     <div className="overflow-x-auto">
      <div className="w-full overflow-hidden rounded-2xl border bg-white shadow-sm">
  <div className="overflow-x-auto">
    <table className="w-full min-w-[1000px] text-sm">
      <thead className="sticky top-0 z-10 bg-gray-50 text-gray-600">
        <tr className="border-b">
          <th className="p-3 text-left font-medium">#</th>
          <th className="p-3 text-left font-medium">Date</th>
          <th className="p-3 text-left font-medium">Item</th>
          <th className="p-3 text-right font-medium">
            Rate 
          </th>
          <th className="p-3 text-right font-medium">Quantity</th>
          <th className="p-3 text-right font-medium">
            Total
          </th>
          <th className="p-3 text-right font-medium"></th>
        </tr>
      </thead>

      <tbody className="divide-y">
        {returns.map(
          (purchase_return) => (
            <Fragment key={purchase_return.id}>
              {purchase_return.return_entries.map((entry, index) => (
                <tr
                  key={`${purchase_return.id}-${index}`}
                
                  className="cursor-pointer transition hover:bg-gray-50"
                >
                  {index === 0 && (
                    <>
                      <td
                        rowSpan={
                          purchase_return.return_entries.length + 1
                        }
                        className="align-top space-x-4 p-3 font-medium text-gray-900 bg-gray-50/40"
                      >
                        <span>{purchase_return.details.serial_number}</span>
                         <button
                          type="button"
                          onClick={() => {
                           selectReturn(purchase_return);
                           setOpenJournalEntries(true);
                          }}
                          className="cursor-pointer rounded-lg border p-2 text-red-600 transition hover:bg-red-50"
                          title="Delete Return"
                        >
                          Journal entries
                        </button>
                      </td>

                      <td
                        rowSpan={
                          purchase_return.return_entries.length + 1
                        }
                        className="align-top p-3 text-gray-600 bg-gray-50/40"
                      >
                        {purchase_return.date}
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
                    {entry.quantity}
                  </td>

                  <td className="p-3 text-right tabular-nums">
                    {entry.return_price && Number(
                      entry.return_quantity * entry.return_price
                    ).toLocaleString()}
                  </td>

                  {index === 0 && (
                    <td
                      rowSpan={
                        purchase_return.return_entries.length + 1
                      }
                      className="align-top p-3 text-right bg-gray-50/20"
                    >
                      <div className="flex flex-col items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                           selectReturn(purchase_return);
                           setOpenReturn(true);
                          }}
                          className="cursor-pointer rounded-lg border p-2 text-blue-600 transition hover:bg-blue-50"
                          title="Edit Return"
                        >
                          <FiEdit2 className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                           selectReturn(purchase_return);
                           setOpenDelete(true);
                          }}
                          className="cursor-pointer rounded-lg border p-2 text-red-600 transition hover:bg-red-50"
                          title="Delete Return"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}

              <tr className="bg-slate-50 font-medium">
                <td
                  colSpan={2}
                  className="p-3 text-left text-gray-700"
                >
                  <div className="flex flex-col items-end">
                    <span className="underline">Total</span>
                    {purchase_return.description && (
                      <span className="text-xs italic text-gray-500">
                        ({purchase_return.description})
                      </span>
                    )}
                  </div>
                </td>

                <td className="p-3 text-right tabular-nums">
                  {Number(
                    purchase_return.details.total_quantity
                  ).toLocaleString()}
                </td>

                <td
                  className="p-3 text-right tabular-nums"
                >
                  {Number(
                    purchase_return.details.total_amount
                  ).toLocaleString()}
                </td>
              </tr>
            </Fragment>
          )
        )}

        {totals && (
          <tr className="bg-gray-100 font-semibold">
            <td colSpan={4} className="p-3 text-gray-800">
              Grand Total
            </td>

            <td className="p-3 text-right tabular-nums">
              {Number(
                totals.quantity
              ).toLocaleString()}
            </td>

            <td className="p-3 text-right tabular-nums">
              {Number(
                totals.amount
              ).toLocaleString()}
            </td>

            <td />
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>
     </div>
       {(openDelete && selected) && <ConfirmModal
             open={openDelete}
             onClose={() => {
              setOpenDelete(false);
              setSelected(null);
            }}
             title="Delete Return"
             description="This action cannot be undone."
             confirmText="Delete"
             tone="danger"
             onConfirm={handleDelete}
           />}
           {(openReturn && selected) && 
              <ReturnModal open={openReturn} onClose={() => {
                setOpenReturn(false);
                setSelected(null);
              }} 
              stocks={stocks ?? []}
              purchaseId={purchaseId}
              editing={true}
              updateReturn={selected}
              salesId={salesId}
              type={type}
              revalidateUrl={revalidateUrl}/>
            }
            {(openJournalEntries && selected) && (
                    <JournalEntriesModal
                      open={openJournalEntries}
                      onClose={() =>{
                        setOpenJournalEntries(false);
                        setSelected(null);
                      }}
                      journalEntries={
                        selected.journal_entries ?? []
                      }
                      journalTotals={
                        selected?.journal_entries_total ?? { debit_total: 0, credit_total: 0}
                      }
                    />
                  )}
   </div>
  )
}

export default PurchaseSalesReturns
