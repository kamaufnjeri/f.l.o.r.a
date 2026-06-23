"use client";

import { replaceDash } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ItemFiltersModal from "./ItemFiltersModal";
import { useModalStore } from "@/stores/modalStore";
import { ModalName } from "@/types";

type Props = {
  title: string;
  organisationId: string;
  goToUrl: string;
  defaultDate: string;

};

export default function ItemFiltersSection({
  defaultDate,
  title,
  organisationId,
  goToUrl,
}: Props) {
  const [date, setDate] = useState(defaultDate)
  const [open, setOpen] = useState(false);
  const { currentOrg } = useAuthStore();
  const router = useRouter();
  
  

  const applyFilters = () => {
    router.push(
      `/dashboard/${organisationId}/${goToUrl}?date=${date}`
    );
    setOpen(false);
  };

  const resetFilters = () => {
    router.push(`/dashboard/${organisationId}/${goToUrl}`);
    setOpen(false);
  };
 
  

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


  const reportDate = formatReportDate(defaultDate);


  return (
  <>
    <div className="space-y-4 w-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

      {/* HEADER */}
      <div className="p-4 text-center bg-gradient-to-b from-gray-50 to-white">
        <p className="text-[11px] uppercase tracking-[0.3em] text-gray-500">
          {currentOrg?.org_name || "Organisation"}
        </p>

        <h2 className="mt-2 text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900">
          {title} ({currentOrg?.currency})
        </h2>

        <p className="mt-1 sm:mt-2 text-sm text-gray-500">
          {reportDate}
        </p>
      </div>

      

        

           
        <div className="border-t px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-3 bg-gray-50">

          <button
            onClick={resetFilters}
            className="text-sm text-gray-500 hover:text-primary transition cursor-pointer"
          >
            Reset all
          </button>

          <button
            onClick={() => setOpen(true)}
            className="
              rounded-xl
              bg-primary
              px-5 py-2.5
              text-sm font-semibold
              text-white
              hover:bg-primary-dark
              transition
              cursor-pointer
              active:scale-[0.98]
            "
          >
            Open Filters
          </button>
        
      </div>
     
    </div>
    {open && <ItemFiltersModal 
      date={date}
      title={title}
      setDate={setDate}
      resetFilters={resetFilters}
      applyFilters={applyFilters}
      onClose={() => setOpen(false)}
      />}
    </>
  );
}