'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { CgMoreVertical } from 'react-icons/cg';

import ConfirmModal from '../common/ConfirmationModal';
import { downloadPdf } from '@/app/actions/download-actions';
import { saveFile } from '@/lib/utils';
import { SalesDetail } from '@/types/sales';
import { deleteSale } from '@/app/actions/sale-actions';
import JournalEntriesModal from './JournalEntriesModal';
import PaymentModal from '../payments/PaymentModal';
import ReturnModal from '../returns/ReturnModal';

type Props = {
  organisationId: string;
  sales: SalesDetail;
};

export default function SalesDropDown({
  organisationId,
  sales,
}: Props) {
  const [open, setOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showJournalEntriesModal, setShowJournalEntriesModal] = useState(false);

  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () =>
      document.removeEventListener('mousedown', handleClickOutside);
  }, []);

 const handleDownload = async () => {
    const toastId = toast.loading("Preparing download...");

    try {
      if (!organisationId) {
        toast.error("Organisation id required", { id: toastId });
        return;
      }
      const title = `Sales ${sales.serial_number}`
      const res = await downloadPdf(
        organisationId,
        sales,
        title,
      );

      if (res.success) {
        saveFile(res.blob, `${title}.pdf`);

        toast.success("Downloaded successfully", {
          id: toastId,
        });
      } else {
        toast.error("Download failed", { id: toastId });
      }
    } catch (error) {
      console.error('Error', error);
      toast.error("Download failed", { id: toastId });
    }
  };

  const handleDelete = async () => {
    try {
      const res = await deleteSale(
        organisationId,
        sales.id
      );

      if (res.success) {
        toast.success('Sales deleted');

        router.push(
          `/dashboard/${organisationId}/sales`
        );
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
    <>
      <div
        className="relative inline-block text-left"
        ref={dropdownRef}
      >
        <button
          onClick={() => setOpen(!open)}
          className="cursor-pointer rounded-xl p-2 transition hover:bg-gray-100"
        >
          <CgMoreVertical className="h-5 w-5 text-gray-700" />
        </button>

        {open && (
          <div className="absolute right-0 z-50 mt-2 w-56 overflow-y-auto max-h-42 rounded-xl border border-gray-200 bg-white shadow-lg">
            <button
              onClick={() => {
                handleDownload();
                setOpen(false);
              }}
              className="w-full cursor-pointer px-4 py-2 text-left text-sm hover:bg-gray-50"
            >
              Download PDF
            </button>
            
            <Link
              href={`/dashboard/${organisationId}/sales/${sales.id}/edit`}
              className="block px-4 py-2 text-sm hover:bg-gray-50"
            >
              Edit
            </Link>
            {(sales.journal_entries && sales?.journal_entries.length > 0) && (
              <button
                onClick={() => {
                  setShowJournalEntriesModal(true);
                  setOpen(false);
                }}
                className="w-full cursor-pointer px-4 py-2 text-left text-sm hover:bg-gray-50"
              >
                Journal Entries
              </button>
            )}

            {sales.details.type === 'invoice' &&
              sales.invoice?.status &&
              sales.invoice.status !== 'unpaid' && (
                <Link
                  href={`/dashboard/${organisationId}/invoices/${sales.invoice.id}/payments`}
                  className="block px-4 py-2 text-sm hover:bg-gray-50"
                >
                  Payments
                </Link>
              )}

            <button
              onClick={() => {
                setShowReturnModal(true);
                setOpen(false);
              }}
              className="w-full cursor-pointer px-4 py-2 text-left text-sm hover:bg-gray-50"
            >
              Return Sales
            </button>
          

             {sales.details.has_returns && (
              <Link
                href={`/dashboard/${organisationId}/sales/${sales.id}/returns`}
                className="block px-4 py-2 text-sm hover:bg-gray-50"
              >
                Sales Returns
              </Link>
            )}

            {(sales.invoice && sales?.invoice?.amount_due > 0) && (
              <button
                onClick={() => {
                  setShowPaymentModal(true);
                  setOpen(false);
                }}
                className="w-full cursor-pointer px-4 py-2 text-left text-sm hover:bg-gray-50"
              >
                Record Payment
              </button>
            )}

            <button
              onClick={() => {
                setShowDeleteModal(true);
                setOpen(false);
              }}
              className="w-full cursor-pointer px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        )}
      </div>

     {showDeleteModal && <ConfirmModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Sale"
        description="This action cannot be undone."
        confirmText="Delete"
        tone="danger"
        onConfirm={handleDelete}
      />}
      {showJournalEntriesModal && <JournalEntriesModal
        open={showJournalEntriesModal}
        onClose={() => setShowJournalEntriesModal(false)}
       journalEntries={sales.journal_entries}
       journalTotals={sales?.journal_entries_total}
      />}
      {(sales.invoice && showPaymentModal) &&
        <PaymentModal debitCreditType='debit' invoiceId={sales?.invoice?.id} open={showPaymentModal} onClose={() => setShowPaymentModal(false)} revalidateUrl={`sales/${sales.id}`}/>
      }
        {(sales && showReturnModal) &&
          <ReturnModal
            stocks={sales.sales_entries.map((entry) => ({ id: entry?.id as string, name: entry.stock_name }))}
            salesId={sales.id}
            
            type='sales' open={showReturnModal} onClose={() => setShowReturnModal(false)} revalidateUrl={`sales/${sales.id}`}/>
      }
    </>
  );
}