"use client";

import { useMemo, useState, ReactNode } from "react";

export type SelectOption = {
  id: string | number;
  name: string;
};

type SelectFieldProps = {
  label?: string;
  name?: string;
  required?: boolean;
  defaultValue?: string | number | null;
  options: SelectOption[];
  isDirty?: boolean;

  placeholder?: string;
  disabled?: boolean;
  icon?: ReactNode;
};

export default function Select({
  label,
  name,
  defaultValue,
  options,
  placeholder = "Select...",
  disabled = false,
  required = false,
  isDirty,
  icon,
}: SelectFieldProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const [selected, setSelected] = useState<SelectOption | null>(
    options.find((o) => o.id === defaultValue) || null
  );


  const filteredOptions = useMemo(() => {
    return options.filter((opt) =>
      opt.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, options]);

  const handleSelect = (opt: SelectOption | null) => {
    setSelected(opt);
    setQuery("");
    setOpen(false);
  };

  return (
    <div className="w-full space-y-2 relative">
      {/* LABEL */}
      {(label || isDirty) && (
        <div className="flex justify-between items-center">
          {label && (
            <label
              htmlFor={name}
              className="text-sm font-medium text-gray-700 flex items-center gap-1"
            >
              {label}
              {required && (
                <span className="text-red-500">*</span>
              )}
            </label>
          )}

          {isDirty && (
            <span className="text-xs text-amber-500 font-medium">
              • edited
            </span>
          )}
        </div>
      )}

      {/* INPUT */}
      <div className="relative">
        {icon && (
          <div
            className="
              absolute left-3 top-1/2 -translate-y-1/2
              text-gray-400 pointer-events-none
            "
          >
            {icon}
          </div>
        )}

        <input
          id={name}
          value={open ? query : selected?.name ?? ""}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          onFocus={() => {
            if (disabled) return;
            setOpen(true);
            setQuery("");
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onBlur={() => {
            setTimeout(() => setOpen(false), 150);
          }}
          className={`
            w-full rounded-xl border border-gray-200 bg-white text-gray-900
            focus:outline-none focus:ring-2 focus:ring-primary/30
            focus:border-primary transition
            disabled:bg-gray-50 disabled:text-gray-400
            ${
              icon
                ? "pl-10 pr-10 py-3"
                : "px-4 pr-10 py-3"
            }
          `}
        />

        {/* Hidden input for forms */}
        {name && (
          <input
            type="hidden"
            name={name}
            value={selected?.id ?? ""}
          />
        )}

        {/* DROPDOWN */}
        {open && !disabled && (
          <div
            className="
              absolute z-50 mt-2 w-full
              bg-white border border-gray-200
              rounded-xl shadow-lg
              max-h-60 overflow-auto
            "
          >
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-sm text-gray-500">
                No results found
              </div>
            ) : (
              filteredOptions.map((opt) => (
                <div
                  key={opt.id}
                  onMouseDown={() => handleSelect(opt)}
                  className="
                    px-4 py-2 cursor-pointer
                    hover:bg-gray-100
                    transition
                  "
                >
                  {opt.name}
                </div>
              ))
            )}
          </div>
        )}

        {/* ARROW */}
        <div
          className="
            absolute right-3 top-1/2 -translate-y-1/2
            text-gray-400 pointer-events-none
          "
        >
          ▼
        </div>
      </div>
    </div>
  );
}