"use client";

import { useState } from "react";
import Modal from "../common/Modal";
import { useRouter } from "next/navigation";
import ModalHeader from "../common/ModalHeader";
import DateFilter from "./DateFilter";
import SortFilter from "./SortFilter";

interface Filters {
  search: string;
  date: string;
  sort_by: string;
  page: string;
}

interface Props {
  initialFilters: Filters;
  organisationId: string;
  onClose: () => void;
}

function JournalFiltersModal({
  initialFilters,
  organisationId,
  onClose,
}: Props) {
  const [filters, setFilters] = useState(initialFilters);
  const router = useRouter();

  const setField = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const buildQuery = () => {
    const params = new URLSearchParams(
      Object.entries(filters).reduce((acc, [key, value]) => {
        acc[key] = value ?? "";
        return acc;
      }, {} as Record<string, string>)
    ).toString();

    return params;
  };

  const applyFilters = () => {
    const params = buildQuery();
    router.push(`/dashboard/${organisationId}/journals?${params}`);
    onClose();
  };

  const resetFilters = () => {
    const reset = {
      search: "",
      date: "",
      sort_by: "",
      page: "1",
    };

    setFilters(reset);
    router.push(`/dashboard/${organisationId}/journals`);
    onClose();
  };

  return (
    <Modal open onClose={onClose}>
      <div className="flex flex-col max-h-[90vh] w-full max-w-lg mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">

        {/* HEADER */}
        <div className="sticky top-0 z-10 bg-white border-b">
          <ModalHeader
            title="Filter journals"
            description="Refine your journal entries using filters"
            onClose={onClose}
          />
        </div>

        {/* BODY */}
        <div className="overflow-y-auto px-5 sm:px-6 py-6 space-y-5 bg-gray-50/50">

          {/* SEARCH */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Search
            </label>

            <input
              value={filters.search}
              onChange={(e) => setField("search", e.target.value)}
              placeholder="Search journals..."
              className="
                w-full
                h-10
                rounded-xl
                border
                border-gray-200
                bg-white
                px-4
                text-sm
                shadow-sm
                transition
                focus:outline-none
                focus:ring-2
                focus:ring-primary/20
                focus:border-primary
                cursor-pointer
              "
            />
          </div>

          {/* DATE */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Date range
            </label>

            <DateFilter
              value={filters.date}
              onChange={(value) => setField("date", value)}
            />
          </div>

          {/* SORT */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Sort by
            </label>

            <SortFilter
              value={filters.sort_by}
              onChange={(value) => setField("sort_by", value)}
              name="sort_by"
              options={[
                { label: "Newest first", value: "newest" },
                { label: "Oldest first", value: "oldest" },
              ]}
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="border-t bg-white px-5 sm:px-6 py-4 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">

          {/* reset */}
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

          {/* actions */}
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="
                flex-1 sm:flex-none
                px-4 py-2
                rounded-xl
                border
                border-gray-200
                text-sm
                font-medium
                bg-white
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
                hover:bg-primary-dark
                transition
                cursor-pointer
                active:scale-[0.98]
              "
            >
              Apply filters
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default JournalFiltersModal;