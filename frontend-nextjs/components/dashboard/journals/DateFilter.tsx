"use client";

import { useState } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function DateFilter({
  value,
  onChange,
}: Props) {
  const [showModal, setShowModal] =
    useState(false);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const applyRange = () => {
    if (!from || !to) return;

    onChange(`${from}to${to}`);
    setShowModal(false);
  };

  return (
    <>
      <select
        value={
          value.includes("to")
            ? "custom"
            : value
        }
        onChange={(e) => {
          const val = e.target.value;

          if (val === "custom") {
            setShowModal(true);
            return;
          }

          onChange(val);
        }}
        className="
          h-11
          w-full
          rounded-xl
          border
          border-gray-200
          bg-white
          px-4
          text-sm
          shadow-sm
          focus:border-black
          focus:outline-none
        "
      >
        <option value="">Date Range</option>
        <option value="today">Today</option>
        <option value="yesterday">Yesterday</option>
        <option value="this_week">This Week</option>
        <option value="this_month">This Month</option>
        <option value="custom">Custom Range</option>
      </select>

      <input
        type="hidden"
        name="date"
        value={value}
      />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold">
              Custom Date Range
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Select a reporting period.
            </p>

            <div className="mt-5 space-y-4">
              <input
                type="date"
                value={from}
                onChange={(e) =>
                  setFrom(e.target.value)
                }
                className="w-full rounded-xl border px-3 py-2"
              />

              <input
                type="date"
                value={to}
                onChange={(e) =>
                  setTo(e.target.value)
                }
                className="w-full rounded-xl border px-3 py-2"
              />
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() =>
                  setShowModal(false)
                }
                className="rounded-xl border px-4 py-2"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={applyRange}
                className="rounded-xl bg-black px-4 py-2 text-white"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}