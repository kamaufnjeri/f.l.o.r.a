'use client'
import { deleteCustomer } from '@/app/actions/customer-actions';
import { downloadItemPdf } from '@/app/actions/download-actions';
import { saveFile } from '@/lib/utils';
import toast from 'react-hot-toast';
import { CgMoreVertical } from 'react-icons/cg';
import ConfirmModal from '../common/ConfirmationModal';
import UpdateCustomerModal from './UpdateCustomerModal';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CustomerDetails } from '@/types';

type Props = {
    organisationId: string,
    customer: CustomerDetails;
    date: string
}
function CustomerDropDown({ organisationId, customer, date}: Props) {
    const [open, setOpen] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
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

      document.addEventListener("mousedown", handleClickOutside);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    const handleDownload = async () => {
    const toastId = toast.loading("Preparing download...");

    try {
      if (!organisationId) {
        toast.error("Organisation id required", { id: toastId });
        return;
      }

      const res = await downloadItemPdf(
        organisationId,
        { date },
        customer.name,
        'customers',
        customer.id
      );
      if (res.success) {
        saveFile(res.blob, `${customer.name}.pdf`);

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
       const res = await deleteCustomer(organisationId, customer.id);

      if (res?.success) {
        toast.success("Customer deleted");
        // redirect or remove from list here
        router.push(`/dashboard/${organisationId}/customers`)
      } else {
        toast.error(res?.error || "Delete failed");
      }
    } catch (error) {
      console.error('Error', error);
      toast.error("Download failed");
    }
   
  };
  return (
    <>
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Icon Button */}
      <button
        onClick={() => setOpen(!open)}
        className="cursor-pointer p-2 rounded-xl hover:bg-gray-100 transition"
      >
        <CgMoreVertical className="w-5 h-5 text-gray-700" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-200 bg-white shadow-lg z-50">
          <button
            onClick={() => {
              handleDownload();
              setOpen(false);
            }}
            className="cursor-pointer w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
          >
            Download PDF
          </button>
          <Link href={`/dashboard/${organisationId}/accounts/${customer.account_id}`} className='cursor-pointer w-full text-left px-4 py-2 text-sm hover:bg-gray-50'>View Account</Link>
          <button
            onClick={() => {
              setShowEditModal(true);
              setOpen(false);
            }}
            className="cursor-pointer w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
          >
            Edit
          </button>
          <button
            onClick={() => {
              setShowDeleteModal(true);
              setOpen(false);
            }}
            className="cursor-pointer w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
          >
            Delete
          </button>
        </div>
      )}

    </div>
    {showEditModal &&  <UpdateCustomerModal
            onClose={() => setShowEditModal(false)}
            customer={{ id: customer.id, name: customer.name, email: customer.email, phone_number: customer.phone_number }}
          />
         }
    {showDeleteModal &&  <ConfirmModal
            open={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            title="Delete Customer"
            description="This will permanently remove this journal entry."
            confirmText="Delete"
            tone="danger"
            onConfirm={handleDelete}
          />
         }
    </>
  )
}

export default CustomerDropDown;
