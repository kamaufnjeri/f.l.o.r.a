"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import ActiveFiltersBar from "./ActiveFiltersBar";
import FiltersModal from "./FiltersModal";

type Filters = Record<string, string>;

export default function FiltersSection({
  filters,
  title,
  goToUrl,
  organisationId,
}: {
  filters: Filters;
  title: string;
  goToUrl: string;
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
      <ActiveFiltersBar
        filters={filters}
        title={title}
        onOpen={() => setOpen(true)}
        resetFilters={resetFilters}
        downloadType={goToUrl}
      />

      {open && (
        <FiltersModal
          title={title}
          goToUrl={goToUrl}
          initialFilters={filters}
          organisationId={organisationId}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}