"use client";

import React from "react";

type InputFieldProps = {
  label?: string;
  name?: string;

  value: string | number;
  onChange: (value: string) => void;

  type?: "text" | "number" | "email" | "password" | "date";
  placeholder?: string;

  required?: boolean;
  disabled?: boolean;
};

export default function InputField({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
  required = false,
  disabled = false,
}: InputFieldProps) {
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

      {/* INPUT */}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChange(e.target.value)
        }
        className="
          w-full px-3 py-2 rounded-lg border border-gray-200
          text-sm text-gray-800 bg-white
          focus:outline-none focus:ring-2 focus:ring-black/10
          disabled:bg-gray-100 disabled:cursor-not-allowed
          transition
        "
      />
    </div>
  );
}