'use client'
import { deleteSupplier } from '@/app/actions/supplier-actions';
import { downloadItemPdf } from '@/app/actions/download-actions';
import { saveFile } from '@/lib/utils';
import toast from 'react-hot-toast';
import { CgMoreVertical } from 'react-icons/cg';
import ConfirmModal from '../common/ConfirmationModal';
import UpdateSupplierModal from './UpdateSupplierModal';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SupplierDetails } from '@/types';

type Props = {
    organisationId: string,
    supplier: SupplierDetails;
    date: string
}
function SupplierDropDown({ organisationId, supplier, date}: Props) {
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
        supplier.name,
        'suppliers',
        supplier.id
      );
      if (res.success) {
        saveFile(res.blob, `${supplier.name}.pdf`);

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
       const res = await deleteSupplier(organisationId, supplier.id);

      if (res?.success) {
        toast.success("Supplier deleted");
        // redirect or remove from list here
        router.push(`/dashboard/${organisationId}/suppliers`)
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
          <Link href={`/dashboard/${organisationId}/accounts/${supplier.account_id}`} className='cursor-pointer w-full text-left px-4 py-2 text-sm hover:bg-gray-50'>View Account</Link>
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
    {showEditModal &&  <UpdateSupplierModal
            onClose={() => setShowEditModal(false)}
            supplier={{ id: supplier.id, name: supplier.name, email: supplier.email, phone_number: supplier.phone_number }}
          />
         }
    {showDeleteModal &&  <ConfirmModal
            open={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            title="Delete Supplier"
            description="This will permanently remove this journal entry."
            confirmText="Delete"
            tone="danger"
            onConfirm={handleDelete}
          />
         }
    </>
  )
}

export default SupplierDropDown;
