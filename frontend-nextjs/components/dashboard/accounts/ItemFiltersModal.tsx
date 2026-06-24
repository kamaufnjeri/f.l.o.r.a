"use client";

import Modal from "../common/Modal";
import ModalHeader from "../common/ModalHeader";
import DateFilter from "../journals/DateFilter";

interface Props {
  date: string;
  title: string;
  setDate: React.Dispatch<React.SetStateAction<string>>;
  onClose: () => void;
  applyFilters: () => void;
  resetFilters: () => void;

}


export default function ItemFiltersModal({
  date = "",
  title,
  setDate,
  onClose,
  applyFilters,
  resetFilters
}: Props) {
    

  return (
    <Modal open onClose={onClose}>
      <div className="flex flex-col max-h-[90vh] w-full max-w-lg mx-auto overflow-hidden">
        {/* HEADER */}
        <div className="sticky top-0 z-10">
          <ModalHeader
            title={`Filter ${title}`}
            description={`Refine your ${title} using filters`}
            onClose={onClose}
          />
        </div>

        {/* BODY */}
          
        <DateFilter value={date} onChange={(val) => setDate(val)}/>


        {/* FOOTER */}
        <div className=" px-5 sm:px-6 py-4 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <button
            onClick={resetFilters}
            className="
              text-sm
              font-medium
              text-gray-500
              hover:text-primary
              transition
              cursor-pointer
            "
          >
            Reset all
          </button>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="
                flex-1 sm:flex-none
                px-4 py-2
                rounded-xl
                border
                border-gray-200
                bg-white
                text-sm
                font-medium
                hover:bg-gray-50
                transition
                cursor-pointer
              "
            >
              Cancel
            </button>

            <button
              onClick={applyFilters}
              className="
                flex-1 sm:flex-none
                px-5 py-2
                rounded-xl
                bg-primary
                text-white
                text-sm
                font-semibold
                transition
                cursor-pointer
                active:scale-[0.98]
              "
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}