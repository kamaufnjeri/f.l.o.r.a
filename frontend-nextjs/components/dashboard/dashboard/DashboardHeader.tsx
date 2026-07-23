"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaX } from "react-icons/fa6";

import { useModalStore } from "@/stores/modalStore";
import { ModalName } from "@/types";

import { useAuthStore } from "@/stores/authStore";
import DashboardDateFilter from "./DashboardDateFilter";
import { replaceDash } from "@/lib/utils";


type Props = {
  organisationId: string;
  date: string;
};



const actions: {
  key: ModalName;
  label: string;
}[] = [

  {
    key: "account",
    label: "Add Account",
  },

  {
    key: "stock",
    label: "Add Stock",
  },

  {
    key: "service",
    label: "Add Service",
  },

  {
    key: "customer",
    label: "Add Customer",
  },

  {
    key: "supplier",
    label: "Add Supplier",
  },

  {
    key: "accountGroups",
    label: "Account Groups",
  },

];



export default function DashboardHeader({
  organisationId,
  date,
}: Props) {


  const router = useRouter();


  const openModal = useModalStore(
    (state) => state.openModal
  );
  const { currentOrg } = useAuthStore();



  const [actionValue, setActionValue] = useState("");


 const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const formatReportDate = (date?: string) => {
    if (!date) return `As at ${today}`;

    const dateLower = date.toLowerCase();
    // 1. RANGE (only if NOT today)
    if (dateLower.includes("to") && dateLower !== 'today') {
      const normalized = date
      .replace(/\s*to\s*/gi, " to ")
      .replace(/\s+/g, " ")
      .trim();
      return `From ${normalized}`;
    }

    // 3. SINGLE VALUE
    return `For ${replaceDash(dateLower)}`;
  };


  const reportDate = formatReportDate(date);

 


  





  const resetDashboard = () => {
    router.push(
      `/dashboard/${organisationId}`
    );

  };





  return (

    <>

      <div
        className="
          bg-white
          border
          border-gray-100
          rounded-2xl
          shadow-sm
          p-5
        "
      >


        <div
          className="
            flex
            flex-col
            lg:flex-row
            lg:items-center
            lg:justify-between
            gap-4
          "
        >



          {/* TITLE */}

          <div>

            <p
              className="
                text-xs
                uppercase
                tracking-widest
                text-gray-400
              "
            >
              {currentOrg?.org_name || "Organisation"}
            </p>


            <h1
              className="
                mt-1
                text-xl
                font-bold
                text-primary
              "
            >
              Dashboard
            </h1>


            <p
              className="
                text-sm
                text-gray-500
                mt-1
              "
            >
              Financial overview and business performance
            </p>


          </div>





          {/* ACTIONS */}

          <div
            className="
              flex
              flex-wrap
              items-center
              gap-2
            "
          >




            {/* DATE SELECT */}
<DashboardDateFilter
  organisationId={organisationId}
  value={date}
/>





           





            {/* QUICK CREATE */}

            <div
              className="
                flex
                items-center
                gap-2
              "
            >

              <span
                className="
                  hidden
                  sm:block
                  text-xs
                  text-gray-400
                "
              >
                Quick Create
              </span>


              <select
                value={actionValue}
                onChange={(e) => {

                  const value =
                    e.target.value;


                  setActionValue("");


                  if(value){

                    openModal(
                      value as ModalName
                    );

                  }

                }}
                className="
                  rounded-xl
                  bg-primary
                  text-white
                  px-4
                  py-2
                  text-sm
                  font-semibold
                  cursor-pointer
                  focus:outline-none
                "
              >

                <option value="">
                  + New
                </option>


                {actions.map(
                  (action) => (

                    <option
                      key={action.key}
                      value={action.key}
                      className="
                        bg-white
                        text-gray-700
                      "
                    >
                      {action.label}
                    </option>

                  )
                )}

              </select>


            </div>



          </div>



        </div>





        {/* ACTIVE FILTER */}

        {date && (

          <div
            className="
              mt-5
              flex
              flex-wrap
              items-center
justify-between
              
              gap-3
              border-t
              p-2
            "
          >


            <div
              className="
                flex
                items-center
                gap-2
                rounded-full
                bg-primary/10
                px-3
                py-1.5
                text-xs
                font-medium
                text-primary
              "
            >

              <span>
                Date:
              </span>


              <span>
                {reportDate}
              </span>


              <button
                type="button"
                onClick={resetDashboard}
                className="
                  flex
                  items-center
                  justify-center
                  rounded-full
                  bg-red-100
                  text-red-500
                  h-5
                  w-5
                  cursor-pointer
                "
              >

                <FaX
                  className="
                    text-[9px]
                  "
                />

              </button>


            </div>





            <button
              type="button"
              onClick={resetDashboard}
              className="
                text-sm
                text-gray-500
                hover:text-primary
                cursor-pointer
              "
            >
              Reset all
            </button>


          </div>

        )}



      </div>






      {/* <CustomRangeModal
        open={showRange}
        onClose={() =>
          setShowRange(false)
        }
        onApply={applyCustomRange}
      /> */}


    </>

  );

}
