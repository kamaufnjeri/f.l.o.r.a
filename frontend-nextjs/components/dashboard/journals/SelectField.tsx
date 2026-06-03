"use client";

import React, { useMemo, useState } from "react";

export type SelectOption = {
  id: string | number;
  name: string;
};

type SelectFieldProps = {
  label?: string;
  value: string | number | "";
  onChange: (value: string | number) => void;
  options: SelectOption[];

  placeholder?: string;
};

export default function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder = "Select...",
}: SelectFieldProps) {
  const [query, setQuery] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);

  const selectedLabel = useMemo(() => {
    return options.find((o) => o.id === value)?.name || "";
  }, [value, options]);

  const filteredOptions = useMemo(() => {
    return options.filter((opt) =>
      opt.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, options]);

  const handleSelect = (opt: SelectOption) => {
    onChange(opt.id);
    setQuery("");
    setOpen(false);
  };

  return (
    <div className="w-full space-y-1 relative">
      {/* LABEL */}
      {label && (
        <label className="text-xs font-medium text-gray-600">
          {label}
        </label>
      )}

      {/* INPUT */}
      <div className="relative">
        <input
          value={open ? query : selectedLabel}
          placeholder={placeholder}
          onFocus={() => {
            setOpen(true);
            setQuery("");
          }}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setQuery(e.target.value)
          }
          onBlur={() => {
            // small delay so click works before closing
            setTimeout(() => setOpen(false), 150);
          }}
          className="
            w-full px-3 py-2 rounded-lg border border-gray-200
            text-sm text-gray-800 bg-white
            focus:outline-none focus:ring-2 focus:ring-black/10
            transition
          "
        />

        {/* DROPDOWN */}
        {open && (
          <div className="absolute z-50 mt-2 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-sm text-gray-500">
                No results found
              </div>
            ) : (
              filteredOptions.map((opt: SelectOption) => (
                <div
                  key={opt.id}
                  onMouseDown={() => handleSelect(opt)}
                  className="
                    px-3 py-2 text-sm cursor-pointer
                    hover:bg-gray-100 transition
                  "
                >
                  {opt.name}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}