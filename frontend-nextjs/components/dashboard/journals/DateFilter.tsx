"use client";

import { useState } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function DateFilter({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const applyRange = () => {
    if (!from || !to) return;

    onChange(`${from}to${to}`);
    setOpen(false);
  };

  const isCustom = value.includes("to");

  return (
    <>
      <div className="relative w-full">
        <select
          value={isCustom ? "custom" : value}
          onChange={(e) => {
            if (e.target.value === "custom") {
              setOpen(true);
              return;
            }
            onChange(e.target.value);
          }}
          className="
            h-10
            w-full
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
            focus:ring-black/10
            focus:border-black
            cursor-pointer
          "
        >
          <option value="">Date range</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="this_week">This week</option>
          <option value="this_month">This month</option>
          <option value="custom">Custom range</option>
        </select>

        <input type="hidden" name="date" value={value} />
      </div>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Custom date range
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Choose a start and end date.
            </p>

            <div className="mt-5 space-y-3">
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-black/10"
              />

              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-black/10"
              />
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-xl border text-sm hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={applyRange}
                className="px-4 py-2 rounded-xl bg-black text-white text-sm hover:bg-black/80"
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