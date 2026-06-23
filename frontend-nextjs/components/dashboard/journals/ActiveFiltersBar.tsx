"use client";

import { downloadListPdf } from "@/app/actions/download-actions";
import { normalizeWord, replaceDash, saveFile } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { ReactNode } from "react";
import toast from "react-hot-toast";


type Props = {
  filters: Record<string, string | undefined>;
  title: string;
  downloadType: string;
  onOpen: () => void;
  resetFilters: () => void;
  modalButtons: ReactNode;
};

// function formatDate(date: string) {
//   return new Date(date).toLocaleDateString("en-GB", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });
// }

// const labelMap: Record<string, string> = {
//   search: "Search",
//   sort_by: "Sort",
//   date: "Date",
//   page: "Page",
// };


export default function ActiveFiltersBar({
  filters,
  title,
  downloadType,
  onOpen,
  resetFilters,
  modalButtons,
}: Props) {
  const { currentOrg } = useAuthStore();

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


  const reportDate = formatReportDate(filters.date);

  const chips = Object.entries(filters).filter(
    ([key, value]) => key !== "date" && value && value.trim() !== ""
  );

  const handleDownload = async () => {
    const toastId = toast.loading("Preparing download...");

    try {
      if (!currentOrg?.id) {
        toast.error("Organisation id required", { id: toastId });
        return;
      }

      const res = await downloadListPdf(
        currentOrg.id,
        filters,
        title,
        downloadType
      );

      if (res.success) {
        saveFile(res.blob, `${title}.pdf`);

        toast.success("Downloaded successfully", {
          id: toastId,
        });
      } else {
        toast.error("Download failed", { id: toastId });
      }
    } catch (error) {
      console.error('Error', error);
      toast.error("Download failed", { id: toastId });
    }
  };

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

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

      {/* CHIPS */}
      {chips.length > 0 && (
        <div className="border-t bg-gray-50 px-4 sm:px-6 py-4 space-y-3">

          <div className="flex flex-wrap justify-center gap-2">
            {chips.map(([key, value]) =>
              value ? (
                <div
                  key={key}
                  className="
                    flex items-center gap-2
                    rounded-full
                    bg-white
                    border border-gray-100
                    px-3 py-1.5
                    text-xs font-medium
                    text-gray-700
                    shadow-sm
                    transition
                    cursor-pointer
                    hover:border-gray-200
                    hover:shadow-md
                  "
                >
                  <span className="text-gray-400 capitalize">
                    {normalizeWord(key)}:
                  </span>

                  <span className="text-gray-900">
                    {normalizeWord(value)}
                  </span>
                </div>
              ) : null
            )}
          </div>

          {/* ACTION BAR */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">

            {/* LEFT ACTIONS */}
            <button
              onClick={resetFilters}
              className="
                text-sm font-medium
                text-gray-500
                hover:text-primary
                transition
                cursor-pointer
              "
            >
              Reset all
            </button>
            {modalButtons}

            {/* RIGHT ACTIONS */}
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">

              {/* Download (PRIMARY) */}
              <button
                onClick={handleDownload}
                className="
                  w-full sm:w-auto
                  rounded-xl
                  bg-primary
                  px-5 py-2.5
                  text-sm font-semibold
                  text-white
                  shadow-sm
                  transition
                  cursor-pointer
                  hover:bg-primary-dark
                  active:scale-[0.98]
                "
              >
                Download PDF
              </button>

              {/* Open Filters (SECONDARY) */}
              <button
                onClick={onOpen}
                className="
                  w-full sm:w-auto
                  rounded-xl
                  border border-gray-200
                  bg-white
                  px-5 py-2.5
                  text-sm font-medium
                  text-gray-700
                  transition
                  cursor-pointer
                  hover:bg-gray-50
                "
              >
                Open Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EMPTY STATE */}
      {chips.length === 0 && (
        <div className="border-t px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-3 bg-gray-50">

          <button
            onClick={resetFilters}
            className="text-sm text-gray-500 hover:text-primary transition cursor-pointer"
          >
            Reset all
          </button>

          <button
            onClick={onOpen}
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
      )}
    </div>
  );
}