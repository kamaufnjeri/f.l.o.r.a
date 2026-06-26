'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { CgMoreVertical } from 'react-icons/cg';

import ConfirmModal from '../common/ConfirmationModal';
import JournalEntriesModal from '../sales/JournalEntriesModal';

import { downloadPdf } from '@/app/actions/download-actions';
import { saveFile } from '@/lib/utils';
import { deleteServiceIncome } from '@/app/actions/service-income-actions';

import { ServiceIncomeDetail } from '@/types/service-income';
import PaymentModal from '../payments/PaymentModal';

type Props = {
  organisationId: string;
  serviceIncome: ServiceIncomeDetail;
};

export default function ServiceIncomeDropDown({
  organisationId,
  serviceIncome,
}: Props) {
  const [open, setOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [showJournalEntriesModal, setShowJournalEntriesModal] =
    useState(false);

  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent
    ) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      'mousedown',
      handleClickOutside
    );

    return () =>
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
  }, []);

  const handleDownload = async () => {
    const toastId = toast.loading(
      'Preparing download...'
    );

    try {
      const title = `Service Income ${serviceIncome.serial_number}`;

      const res = await downloadPdf(
        organisationId,
        serviceIncome,
        title
      );

      if (res.success) {
        saveFile(res.blob, `${title}.pdf`);

        toast.success(
          'Downloaded successfully',
          {
            id: toastId,
          }
        );
      } else {
        toast.error('Download failed', {
          id: toastId,
        });
      }
    } catch (error) {
      console.error(error);

      toast.error('Download failed', {
        id: toastId,
      });
    }
  };

  const handleDelete = async () => {
    try {
      const res = await deleteServiceIncome(
        organisationId,
        serviceIncome.id
      );

      if (res.success) {
        toast.success(
          'Service income deleted'
        );

        router.push(
          `/dashboard/${organisationId}/service-income`
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
          onClick={() => setOpen((prev) => !prev)}
          className="cursor-pointer rounded-xl p-2 transition hover:bg-gray-100"
        >
          <CgMoreVertical className="h-5 w-5 text-gray-700" />
        </button>

        {open && (
          <div
            className="
              absolute right-0 z-50 mt-2
              w-56 overflow-hidden
              rounded-xl border border-gray-200
              bg-white shadow-lg
            "
          >
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
              href={`/dashboard/${organisationId}/service-income/${serviceIncome.id}/edit`}
              className="block px-4 py-2 text-sm hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              Edit
            </Link>

            {serviceIncome.journal_entries &&
              serviceIncome.journal_entries.length >
                0 && (
                <button
                  onClick={() => {
                    setShowJournalEntriesModal(
                      true
                    );
                    setOpen(false);
                  }}
                  className="w-full cursor-pointer px-4 py-2 text-left text-sm hover:bg-gray-50"
                >
                  Journal Entries
                </button>
              )}

            {serviceIncome.details.type ===
              'invoice' &&
              serviceIncome.invoice?.status &&
              serviceIncome.invoice.status !==
                'unpaid' && (
                <Link
                  href={`/dashboard/${organisationId}/invoices/${serviceIncome.invoice.id}/payments`}
                  className="block px-4 py-2 text-sm hover:bg-gray-50"
                  onClick={() =>
                    setOpen(false)
                  }
                >
                  Payments
                </Link>
              )}
            {(serviceIncome.invoice && serviceIncome?.invoice?.amount_due > 0) && (
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

      {showDeleteModal && (
        <ConfirmModal
          open={showDeleteModal}
          onClose={() =>
            setShowDeleteModal(false)
          }
          title="Delete Service Income"
          description="This action cannot be undone."
          confirmText="Delete"
          tone="danger"
          onConfirm={handleDelete}
        />
      )}

      {showJournalEntriesModal && (
        <JournalEntriesModal
          open={showJournalEntriesModal}
          onClose={() =>
            setShowJournalEntriesModal(false)
          }
          journalEntries={
            serviceIncome.journal_entries ?? []
          }
          journalTotals={
            serviceIncome.journal_entries_total
          }
        />
      )}
      {(serviceIncome.invoice && showPaymentModal) &&
              <PaymentModal debitCreditType='debit' invoiceId={serviceIncome?.invoice?.id} open={showPaymentModal} onClose={() => setShowPaymentModal(false)} revalidateUrl={`service-income/${serviceIncome.id}`}/>
            }
    </>
  );
}