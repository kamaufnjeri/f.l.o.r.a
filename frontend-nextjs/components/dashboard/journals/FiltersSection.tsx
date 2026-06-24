"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import ActiveFiltersBar from "./ActiveFiltersBar";
import FiltersModal from "./FiltersModal";
import { useModalStore } from "@/stores/modalStore";
import { ModalName } from "@/types";
import { baseButton, variants } from "../layout/Header";
import { buildQuery } from "@/lib/utils";

type Filters = Record<string, string>;

export default function FiltersSection({
  filters,
  title,
  goToUrl,
  organisationId,
    account = false,
    stock = false,
    service = false,
    customer = false,
    supplier = false,
}: {
  filters: Filters;
  title: string;
  goToUrl: string;
  organisationId: string;
   account?: boolean;
  stock?: boolean;
  service?: boolean;
  supplier?: boolean;
  customer?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const openModal = useModalStore((s) => s.openModal);
  
  const actions: { key: ModalName; label: string; show: boolean }[] = [
    { key: "account", label: "Add Account", show: account },
    { key: "stock", label: "Add Stock", show: stock },
    { key: "service", label: "Add Service", show: service },
    { key: "customer", label: "Add Customer", show: customer },
    { key: "supplier", label: "Add Supplier", show: supplier },
  ];
  const resetFilters = () => {
    router.push(`/dashboard/${organisationId}/${goToUrl}`);
    setOpen(false);
  };
  const removeFilter = (key: string) => {
    const updatedFilters = Object.fromEntries(
      Object.entries(filters).filter(([k]) => k !== key)
    );

    router.push(
      `/dashboard/${organisationId}/${goToUrl}?${buildQuery(updatedFilters, true)}`
    );

  };

  return (
    <div className="space-y-4">
      <ActiveFiltersBar
        filters={filters}
        title={title}
        onOpen={() => setOpen(true)}
        resetFilters={resetFilters}
        removeFilter={removeFilter}
        downloadType={goToUrl}
        modalButtons={actions
                    .filter((a) => a.show)
                    .map((action) => (
                      <button
                        key={action.key}
                        onClick={() => openModal(action.key)}
                        className={`${baseButton} ${variants[action.key]}`}
                      >
                        + {action.label}
                      </button>
                    ))}
      />
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-start sm:justify-end">
        
                
                </div>

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