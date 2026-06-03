"use client";

import React from "react";

type TextAreaFieldProps = {
  label?: string;
  name?: string;

  value: string;
  onChange: (value: string) => void;

  placeholder?: string;

  required?: boolean;
  disabled?: boolean;

  rows?: number;
};

export default function TextAreaField({
  label,
  name,
  value,
  onChange,
  placeholder = "",
  required = false,
  disabled = false,
  rows = 4,
}: TextAreaFieldProps) {
  return (
    <div className="w-full space-y-1">
      {/* LABEL */}
      {label && (
        <label
          htmlFor={name}
          className="text-xs font-medium text-gray-600"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* TEXTAREA */}
      <textarea
        id={name}
        name={name}
        value={value}
        rows={rows}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          onChange(e.target.value)
        }
        className="
          w-full px-3 py-2 rounded-lg border border-gray-200
          text-sm text-gray-800 bg-white
          focus:outline-none focus:ring-2 focus:ring-black/10
          disabled:bg-gray-100 disabled:cursor-not-allowed
          transition resize-none
        "
      />
    </div>
  );
}