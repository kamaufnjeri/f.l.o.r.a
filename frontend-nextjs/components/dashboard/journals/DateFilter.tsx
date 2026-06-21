"use client";

import { useMemo, useState } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function DateFilter({ value, onChange }: Props) {
  const isCustom = value.includes("to");

  // derive from/to instead of syncing with useEffect
  const { initialFrom, initialTo } = useMemo(() => {
    if (isCustom) {
      const [f, t] = value.split("to");
      return { initialFrom: f || "", initialTo: t || "" };
    }
    return { initialFrom: "", initialTo: "" };
  }, [value, isCustom]);

  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [showCustom, setShowCustom] = useState(isCustom);

  const handleModeChange = (val: string) => {
    if (val === "custom") {
      setShowCustom(true);
      return;
    }

    setShowCustom(false);
    setFrom("");
    setTo("");
    onChange(val);
  };

  const handleFrom = (v: string) => {
    setFrom(v);
    if (to) onChange(`${v}to${to}`);
  };

  const handleTo = (v: string) => {
    setTo(v);
    if (from) onChange(`${from}to${v}`);
  };

  return (
    <div className="w-full space-y-3">

      {/* MAIN SELECT */}
      <select
        value={showCustom ? "custom" : value}
        onChange={(e) => handleModeChange(e.target.value)}
        className="
          h-10 w-full
          rounded-xl border border-gray-200
          bg-white px-4 text-sm
          shadow-sm transition
          focus:outline-none focus:ring-2 focus:ring-black/10
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

      {/* INLINE CUSTOM RANGE */}
      {showCustom && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">

          <div className="space-y-1">
            <label className="text-xs text-gray-500">From</label>
            <input
              type="date"
              value={from}
              onChange={(e) => handleFrom(e.target.value)}
              className="
                w-full rounded-lg border border-gray-200
                px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-black/10
              "
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-500">To</label>
            <input
              type="date"
              value={to}
              onChange={(e) => handleTo(e.target.value)}
              className="
                w-full rounded-lg border border-gray-200
                px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-black/10
              "
            />
          </div>

        </div>
      )}

      <input type="hidden" name="date" value={value} />
    </div>
  );
}