'use client'
import { deleteStock } from '@/app/actions/stock-actions';
import { downloadItemPdf } from '@/app/actions/download-actions';
import { saveFile } from '@/lib/utils';
import toast from 'react-hot-toast';
import { CgMoreVertical } from 'react-icons/cg';
import ConfirmModal from '../common/ConfirmationModal';
import UpdateStockModal from './UpdateStockModal';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { StockDetails } from '@/types';

type Props = {
    organisationId: string,
    stock: StockDetails;
    date: string
}
function StockDropDown({ organisationId, stock, date}: Props) {
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
        stock.name,
        'stocks',
        stock.id
      );
      if (res.success) {
        saveFile(res.blob, `${stock.name}.pdf`);

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
       const res = await deleteStock(organisationId, stock.id);

      if (res?.success) {
        toast.success("Stock deleted");
        // redirect or remove from list here
        router.push(`/dashboard/${organisationId}/stocks`)
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
    {showEditModal &&  <UpdateStockModal
            onClose={() => setShowEditModal(false)}
            stock={{ id: stock.id, name: stock.name, unit_name: stock.unit_name, unit_alias: stock.unit_alias }}
          />
         }
    {showDeleteModal &&  <ConfirmModal
            open={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            title="Delete Stock"
            description="This will permanently remove this journal entry."
            confirmText="Delete"
            tone="danger"
            onConfirm={handleDelete}
          />
         }
    </>
  )
}

export default StockDropDown;
