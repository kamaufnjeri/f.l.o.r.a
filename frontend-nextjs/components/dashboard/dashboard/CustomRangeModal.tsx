"use client";

import { useState } from "react";

import Modal from "../common/Modal";
import ModalHeader from "../common/ModalHeader";
import InputField from "../journals/InputField";


type Props = {
  open: boolean;
  onClose: () => void;
  onApply: (
    from: string,
    to: string
  ) => void;
  initialFrom?: string;
  initialTo?: string;
};


export default function CustomRangeModal({
  open,
  onClose,
  onApply,
  initialFrom = "",
  initialTo = "",
}: Props) {


  const [from, setFrom] = useState(initialFrom);

  const [to, setTo] = useState(initialTo);




  const handleApply = () => {

    if (!from || !to) {
      return;
    }


    onApply(
      from,
      to
    );

  };




  return (

    <Modal
      open={open}
      onClose={onClose}
    >

      <div
        className="
          w-full
          max-w-md
          mx-auto
          bg-white
          rounded-2xl
          overflow-hidden
        "
      >


        {/* HEADER */}

        <div
          className="
            border-b
            bg-white
          "
        >

          <ModalHeader
            title="Custom Date Range"
            description="Select the period you want to view"
            onClose={onClose}
          />

        </div>





        {/* BODY */}

        <div
          className="
            p-5
            space-y-5
            bg-gray-50/50
          "
        >


          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              gap-4
            "
          >


            <InputField
              type="date"
              name="from"
              label="From Date"
              value={from}
              onChange={(value)=>setFrom(value)}
              placeholder="Select start date"
            />



            <InputField
              type="date"
              name="to"
              label="To Date"
              value={to}
              onChange={(value)=>setTo(value)}
              placeholder="Select end date"
            />


          </div>




          {
            from &&
            to &&
            from > to && (

              <p
                className="
                  text-sm
                  text-red-500
                "
              >
                From date cannot be after To date.
              </p>

            )
          }



        </div>






        {/* FOOTER */}

        <div
          className="
            border-t
            bg-white
            px-5
            py-4
            flex
            flex-col
            sm:flex-row
            gap-3
            sm:justify-end
          "
        >


          <button
            type="button"
            onClick={onClose}
            className="
              px-5
              py-2.5
              rounded-xl
              border
              border-gray-200
              text-sm
              font-medium
              text-gray-700
              hover:bg-gray-50
              cursor-pointer
            "
          >
            Cancel
          </button>




          <button
            type="button"
            disabled={
              !from ||
              !to ||
              from > to
            }
            onClick={handleApply}
            className="
              px-5
              py-2.5
              rounded-xl
              bg-primary
              text-white
              text-sm
              font-semibold
              cursor-pointer
              disabled:bg-gray-300
              disabled:cursor-not-allowed
              hover:bg-primary-dark
              transition
            "
          >
            Apply Range
          </button>


        </div>



      </div>


    </Modal>

  );

}
