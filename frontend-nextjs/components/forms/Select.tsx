"use client";

import { ReactNode, useMemo, useState } from "react";

type Option = {
  name: string;
  id: string | number;
};

type Props = {
  label: string;
  name: string;
  options: Option[];

  placeholder?: string;
  required?: boolean;

  icon?: ReactNode;

  defaultValue?: string | number;
};

export default function Select({
  label,
  name,
  options,
  placeholder = "Select option",
  required,
  icon,
  defaultValue,
}: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Option | null>(
    options.find((o) => o.id === defaultValue) || null
  );

  const filteredOptions = useMemo(() => {
    return options.filter((opt) =>
      opt.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, options]);

  const handleSelect = (opt: Option) => {
    setSelected(opt);
    setQuery(opt.name);
    setOpen(false);
  };

  return (
    <div className="w-full space-y-2 relative">
      {/* Label */}
      <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>

      {/* Input wrapper */}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {icon}
          </div>
        )}

        {/* Input */}
        <input
          name={name}
          value={query}
          placeholder={placeholder}
          required={required}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          className={`
            w-full rounded-xl border border-gray-200 bg-white text-gray-900
            focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
            transition
            ${icon ? "pl-10 pr-10 py-3" : "px-4 pr-10 py-3"}
          `}
        />

        {/* Hidden real value for form submission */}
        <input type="hidden" name={name} value={selected?.id ?? ""} />

        {/* Dropdown */}
        {open && (
          <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-sm text-gray-500">
                No results found
              </div>
            ) : (
              filteredOptions.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => handleSelect(opt)}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                >
                  {opt.name}
                </div>
              ))
            )}
          </div>
        )}

        {/* Arrow */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          ▼
        </div>
      </div>
    </div>
  );
}