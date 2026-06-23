"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Modal from "../common/Modal";
import ModalHeader from "../common/ModalHeader";
import DateFilter from "./DateFilter";
import SortFilter from "./SortFilter";
import InputField from "./InputField";
import { sortOptions } from "@/constants";

type Filters = Record<string, string>;

interface Props {
  initialFilters: Filters;
  organisationId: string;
  title: string;
  goToUrl: string;
  onClose: () => void;
}

const includesAny = (
  key: string,
  values: string[]
) => values.some((v) =>
  key.toLowerCase().includes(v.toLowerCase())
);

export default function FiltersModal({
  initialFilters,
  organisationId,
  title,
  goToUrl,
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
    return new URLSearchParams(
      Object.entries(filters).reduce(
        (acc, [key, value]) => {
          acc[key] = value ?? "";
          return acc;
        },
        {} as Record<string, string>
      )
    ).toString();
  };

  const applyFilters = () => {
    router.push(
      `/dashboard/${organisationId}/${goToUrl}?${buildQuery()}`
    );
    onClose();
  };

  const resetFilters = () => {
    const reset = Object.keys(filters).reduce(
      (acc, key) => {
        acc[key] = key === "page" ? "1" : "";
        return acc;
      },
      {} as Record<string, string>
    );

    setFilters(reset);

    router.push(`/dashboard/${organisationId}/${goToUrl}`);
    onClose();
  };

  return (
    <Modal open onClose={onClose}>
      <div className="flex flex-col max-h-[90vh] w-full max-w-lg mx-auto overflow-hidden">
        {/* HEADER */}
        <div className="sticky top-0 z-10 bg-white border-b">
          <ModalHeader
            title={`Filter ${title}`}
            description={`Refine your ${goToUrl} using filters`}
            onClose={onClose}
          />
        </div>

        {/* BODY */}
        <div className="overflow-y-auto grid grid-cols-1 gap-2 md:grid-cols-2 px-5 sm:px-6 py-6 space-y-5 bg-gray-50/50">
          {Object.entries(filters).map(([key, value]) => {
            if (key === "page") return null;

            const label = key
              .replaceAll("_", " ")
              .replace(/\b\w/g, (c) => c.toUpperCase());

            return (
              <div key={key} className={`space-y-1 ${key === 'date' ? 'md:col-span-2': ''}`}>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {label}
                </label>

                {/* DATE */}
                {includesAny(key, ["date", "due_date"]) ? (
                  <DateFilter
                    value={value}
                    onChange={(v) => setField(key, v)}
                  />
                ) : includesAny(key, ["sort"]) ? (
                  <SortFilter
                    value={value}
                    onChange={(v) => setField(key, v)}
                    name={key}
                    options={sortOptions}
                  />
                ) : (
                   <InputField
                    value={value}
                    onChange={(v) => setField(key, v)}
                    name={key}
                    placeholder={`Enter ${label.toLowerCase()}`}

                    />
                  // <input
                  //   value={value}
                  //   onChange={(e) =>
                  //     setField(key, e.target.value)
                  //   }
                  //   placeholder={`Enter ${label.toLowerCase()}`}
                  //   className="
                  //     w-full
                  //     h-10
                  //     rounded-xl
                  //     border
                  //     border-gray-200
                  //     bg-white
                  //     px-4
                  //     text-sm
                  //     shadow-sm
                  //     transition
                  //     focus:outline-none
                  //     focus:ring-2
                  //     focus:ring-primary/20
                  //     focus:border-primary
                  //   "
                  // />
                )}
              </div>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className="border-t bg-white px-5 sm:px-6 py-4 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
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
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}