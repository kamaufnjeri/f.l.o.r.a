"use client";

import { ReactNode } from "react";

type Props = {
  label: string;
  name: string;
  value?: string | number;
  type?: string;
  placeholder?: string;
  required?: boolean;
  icon?: ReactNode; // 👈 optional icon
};

export default function Input({
  label,
  name,
  value,
  type = "text",
  placeholder,
  required,
  icon,
}: Props) {
  return (
    <div className="w-full space-y-2">
      {/* Label */}
      <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>

      {/* Input wrapper */}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}

        <input
          name={name}
          type={type}
          defaultValue={value}
          placeholder={placeholder}
          required={required}
          className={`
            w-full rounded-xl border border-gray-200 bg-white text-gray-900
            placeholder:text-gray-400
            focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
            transition
            ${icon ? "pl-10 pr-4 py-3" : "px-4 py-3"}
          `}
        />
      </div>
    </div>
  );
}