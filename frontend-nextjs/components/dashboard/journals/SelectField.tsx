"use client";

import React, { useMemo, useState } from "react";

export type SelectOption = {
  id: string | number;
  name: string;
};

type SelectFieldProps = {
  label?: string;
  name?: string;
  required?: boolean;
  value: string | number | "";
  onChange: (value: string | number) => void;
  options: SelectOption[];
  isDirty?: boolean;

  placeholder?: string;
  disabled?: boolean;
};

export default function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  placeholder = "Select...",
  disabled = false,
  required = false,
  isDirty,
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
       {(label || required || isDirty) && <div className="flex justify-between items-center">
      {label && (
        <label
          htmlFor={name}
          className="text-xs font-medium text-gray-600"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {isDirty && <span className="text-yellow-500 text-xs">• edited</span>}

      </div>}

      {/* INPUT */}
      <div className="relative">
        <input
          value={open ? query : selectedLabel}
          placeholder={placeholder}
          disabled={disabled}
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
            w-full px-3 py-2 h-10 rounded-lg border border-gray-200
            text-sm text-gray-800 bg-white
            focus:outline-none focus:ring-2 focus:ring-black/10
            transition
          "
        />

        {/* DROPDOWN */}
        {(open && !disabled) && (
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