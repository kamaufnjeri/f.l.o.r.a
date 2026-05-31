"use client";

import { ReactNode } from "react";

type Props = {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  icon?: ReactNode; // optional icon
  rows?: number;
};

export default function Textarea({
  label,
  name,
  placeholder,
  required,
  icon,
  rows = 4,
}: Props) {
  return (
    <div className="w-full space-y-2">
      {/* Label */}
      <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>

      {/* Wrapper */}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-3 text-gray-400">
            {icon}
          </div>
        )}

        <textarea
          name={name}
          placeholder={placeholder}
          required={required}
          rows={rows}
          className={`
            w-full rounded-xl border border-gray-200 bg-white text-gray-900
            placeholder:text-gray-400
            focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
            transition resize-none
            ${icon ? "pl-10 pr-4 py-3" : "px-4 py-3"}
          `}
        />
      </div>
    </div>
  );
}