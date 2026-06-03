"use client";

import { useState } from "react";
import DateFilter from "./DateFilter";
import SortFilter from "./SortFilter";
import ActiveFiltersBar from "./ActiveFiltersBar";

export default function JournalFilters() {
  const [filters, setFilters] = useState({
    search: "",
    date: "",
    sort_by: "",
  });

  const setField = (
    key: string,
    value: string
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      date: "",
      sort_by: "",
    });
  };

  return (
    <div className="space-y-5">
      <form
        method="GET"
        action="/dashboard/journals"
        className="
          rounded-2xl
          border
          bg-white
          p-4
          shadow-sm
        "
      >
        <div
          className="
            grid
            gap-3
            grid-cols-1
            md:grid-cols-[2fr_1fr_1fr_auto]
          "
        >
          <input
            name="search"
            value={filters.search}
            onChange={(e) =>
              setField(
                "search",
                e.target.value
              )
            }
            placeholder="Search journals..."
            className="
              h-11
              rounded-xl
              border
              border-gray-200
              px-4
              text-sm
              shadow-sm
              focus:border-black
              focus:outline-none
            "
          />

          <DateFilter
            value={filters.date}
            onChange={(value) =>
              setField("date", value)
            }
          />

          <SortFilter
            value={filters.sort_by}
            onChange={(value) =>
              setField("sort_by", value)
            }
            name="sort_by"
            options={[
              {
                label: "Newest",
                value: "newest",
              },
              {
                label: "Oldest",
                value: "oldest",
              },
            ]}
          />

          <div className="flex gap-2">
            <button
              type="submit"
              className="
                h-11
                flex-1
                rounded-xl
                bg-black
                px-4
                text-sm
                font-medium
                text-white
                transition
                hover:bg-gray-800
              "
            >
              Apply
            </button>

            <button
              type="button"
              onClick={resetFilters}
              className="
                h-11
                flex-1
                rounded-xl
                border
                bg-white
                px-4
                text-sm
                font-medium
                hover:bg-gray-50
              "
            >
              Reset
            </button>
          </div>
        </div>
      </form>

      <ActiveFiltersBar
        filters={filters}
      />
    </div>
  );
}