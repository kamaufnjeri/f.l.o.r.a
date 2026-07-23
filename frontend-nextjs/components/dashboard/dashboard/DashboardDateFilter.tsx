"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { dateOptions } from "@/constants";

import CustomRangeModal from "./CustomRangeModal";


type Props = {
  organisationId: string;
  value: string;
};


export default function DashboardDateFilter({
  organisationId,
  value,
}: Props) {

  const router = useRouter();


  const isCustom =
    value.includes("to") &&
    value !== "today";


  const { initialFrom, initialTo } = useMemo(() => {

    if (isCustom) {

      const [from, to] = value.split("to");

      return {
        initialFrom: from || "",
        initialTo: to || "",
      };

    }

    return {
      initialFrom: "",
      initialTo: "",
    };


  }, [value, isCustom]);



  const [showModal, setShowModal] = useState(false);

  const [from, setFrom] = useState(initialFrom);

  const [to, setTo] = useState(initialTo);



  const changeDate = (
    date: string
  ) => {


    if(date === "custom") {

      setShowModal(true);

      return;

    }


    router.push(
      `/dashboard/${organisationId}?date=${date}`
    );

  };



  const applyCustomRange = (
    fromDate:string,
    toDate:string
  ) => {


    setFrom(fromDate);
    setTo(toDate);


    router.push(
      `/dashboard/${organisationId}?date=${fromDate}to${toDate}`
    );


    setShowModal(false);

  };



  return (

    <>

      <select
        value={
          isCustom
            ? "custom"
            : value || "all"
        }
        onChange={(e)=>changeDate(e.target.value)}
        className="
          rounded-xl
          border
          border-gray-200
          bg-white
          px-4
          py-2
          text-sm
          cursor-pointer
          focus:outline-none
        "
      >

        {dateOptions.map(
          (option)=>(
            <option
              key={option.value}
              value={option.value}
            >
              {option.name}
            </option>
          )
        )}



      </select>




      <CustomRangeModal
        open={showModal}
        onClose={() =>
          setShowModal(false)
        }
        initialFrom={from}
        initialTo={to}
        onApply={
          applyCustomRange
        }
      />


    </>

  );

}
