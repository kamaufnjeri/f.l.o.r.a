"use client";

import { useState } from "react";
import ActiveFiltersBar from "./ActiveFiltersBar";
import JournalFIltersModal from "./JournalFIltersModal";
import { useRouter } from "next/navigation";

export default function JournalFilters({
  filters: initialFilters,
  organisationId,
}: {
  filters: {
    search: string;
    date: string;
    sort_by: string;
    page: string;
  };
  organisationId: string;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const resetFilters = () => {
        
    router.push(`/dashboard/${organisationId}/journals`);
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      
      {/* ACTIVE FILTERS */}
      <ActiveFiltersBar filters={initialFilters} title="Journal Entries" onOpen={() => setOpen(true)} resetFilters={resetFilters} downloadType='journals'/>

      {/* MODAL */}
      {open && <JournalFIltersModal onClose={() => setOpen(false)} initialFilters={initialFilters} organisationId={organisationId}/>}
    </div>
  );
}