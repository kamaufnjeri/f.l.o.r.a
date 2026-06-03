"use client";

import React from "react";

export type Option = {
  label: string;
  value: string;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  name: string;
};

export default function SelectFilter({
  value,
  onChange,
  options,
  placeholder = "Select",
  name
}: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-md border border-gray-300 p-2 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
      name={name}
    >
      <option value="">{placeholder}</option>

      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}