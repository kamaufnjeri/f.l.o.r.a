'use client'

import { capitalizeFirstLetter } from "@/lib/utils";
import { PaymentDetails, PaymentFormData, PaymentTotals } from "@/types";
import { Fragment, useState } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import ConfirmModal from "../common/ConfirmationModal";
import PaymentModal from "./PaymentModal";
import { deletePayment } from "@/app/actions/payment-actions";
import toast from "react-hot-toast";


function BillInvoicePayments( {  organisationId,
  payments,
  totals,
  type = 'bills',
  billId,
  invoiceId,
}: {
    organisationId: string;
  payments: PaymentDetails[];
  totals: PaymentTotals;
  type: "bills" | "invoices";
  billId?: string;
  invoiceId?: string;
}) {
  const [openPayment, setOpenPayment] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selected, setSelected] = useState<PaymentFormData | null>(null);
  const revalidateUrl = `{type}/${billId ?? invoiceId}/payments`;
 const debitCreditType = type === "bills" ? "credit" : "debit";

const selectPayment = (payment: PaymentDetails) => {
  setSelected({
    id: payment.id,
    date: payment.date,
    description: payment.description,
    journal_entries: payment.journal_entries
  });
};

   const handleDelete = async () => {
    try {
      if (!selected || !selected?.id) {
        toast.error('No payment selected')
      }

      const res = await deletePayment(
        organisationId,
        selected?.id as string,
        revalidateUrl
      );

      if (res.success) {
        toast.success('Payment deleted');

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
       <table className="w-full min-w-[900px] text-sm">
         <thead className="sticky top-0 z-10 bg-gray-50 text-gray-600">
           <tr className="border-b">
             <th className="p-3 text-left font-medium">
               #
             </th>
             <th className="p-3 text-left font-medium">Date</th>
             <th className="p-3 text-left font-medium">Type</th>
             <th className="p-3 text-left font-medium">Description</th>
             <th className="p-3 text-left font-medium">
               Account
             </th>
             <th className="p-3 text-right font-medium">Debit</th>
             <th className="p-3 text-right font-medium">Credit</th>
             <th className="p-3 text-right font-medium"></th>
           </tr>
         </thead>
   
         <tbody className="divide-y">
           {payments?.map((payment) => (
            <Fragment key={payment.id}>
      {payment.journal_entries.map((entry, i) => (
        <tr
          key={entry.id}
          className="hover:bg-gray-50 transition"
        >
          {i === 0 && (
            <>
              <td
                rowSpan={payment.journal_entries.length + 1}
                className="align-top p-3 font-medium text-gray-900 bg-gray-50/40"
              >
                {payment.details.serial_number}
              </td>
              <td
                rowSpan={payment.journal_entries.length + 1}
                className="align-top p-3 text-gray-600 bg-gray-50/40"
              >
               {payment.date}
              </td>
              <td
                rowSpan={payment.journal_entries.length + 1}
                className="align-top p-3 text-gray-600 bg-gray-50/40"
              >
               {capitalizeFirstLetter(
                     payment.details.type
                   )}
              </td>


              <td
                rowSpan={payment.journal_entries.length + 1}
                className="align-top p-3 text-gray-500 italic bg-gray-50/20 max-w-xs"
              >
                {payment.description}
              </td>
            </>
          )}

          <td className="p-3 text-gray-800">
            {entry.account_name}
          </td>

          <td className="p-3 text-right tabular-nums">
            {entry.debit_credit === "debit"
              ? entry.amount.toLocaleString()
              : "—"}
          </td>

          <td className="p-3 text-right tabular-nums">
            {entry.debit_credit === "credit"
              ? entry.amount.toLocaleString()
              : "—"}
          </td>

          {i === 0 && (
            <td
              rowSpan={payment.journal_entries.length + 1}
              className="align-top p-3 text-right bg-gray-50/20"
            >
               <div className="flex flex-col items-center justify-end gap-2">
      <button
        type="button"
        onClick={() => {
          selectPayment(payment);
          setOpenPayment(true);
        }}
        className=" cursor-pointer rounded-lg border p-2 text-blue-600 transition hover:bg-blue-50"
        title="Edit Payment"
      >
        <FiEdit2 className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={() => {
          selectPayment(payment);
          setOpenDelete(true);
        }}
        className="cursor-pointer rounded-lg border p-2 text-red-600 transition hover:bg-red-50"
        title="Delete Payment"
      >
        <FiTrash2 className="h-4 w-4" />
      </button>
    </div>
            </td>
          )}
        </tr>
      ))}
      {payment.journal_entries_total && <tr className="bg-slate-50 font-medium">
  <td className="p-3 text-gray-700">
    Total
  </td>

  <td className="p-3 text-right tabular-nums">
    {Number(
      payment.journal_entries_total.debit_total
    ).toLocaleString()}
  </td>

  <td className="p-3 text-right tabular-nums">
    {Number(
      payment.journal_entries_total.credit_total
    ).toLocaleString()}
  </td>
</tr>}
    </Fragment>
      
           ))}
   
           {totals && (
             <tr className="bg-gray-100 font-semibold">
               <td colSpan={6} className="p-3 text-gray-800">
                 Total Amount Paid
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
       {(openDelete && selected) && <ConfirmModal
             open={openDelete}
             onClose={() => {
              setOpenDelete(false);
              setSelected(null);
            }}
             title="Delete Payment"
             description="This action cannot be undone."
             confirmText="Delete"
             tone="danger"
             onConfirm={handleDelete}
           />}
           {(openPayment && selected) && 
              <PaymentModal open={openPayment} onClose={() => {
                setOpenPayment(false);
                setSelected(null);
              }} 
              billId={billId}
              editing={true}
              updatePayment={selected}
              invoiceId={invoiceId}
              debitCreditType={debitCreditType}
              revalidateUrl={revalidateUrl}/>
            }
   </div>
  )
}

export default BillInvoicePayments
