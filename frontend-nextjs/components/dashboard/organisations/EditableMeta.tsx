"use client";

import React from "react";

interface EditableMetaProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
  editing: boolean;
  onChange: (value: string) => void;
}

export default function EditableMeta({
  icon,
  label,
  value,
  editing,
  onChange,
}: EditableMetaProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        {icon}
        <span>{label}</span>
      </div>

      {editing ? (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-2 w-full border-b bg-transparent text-sm font-medium outline-none focus:border-indigo-500"
        />
      ) : (
        <p className="mt-2 truncate text-sm font-medium text-gray-900">
          {value || "—"}
        </p>
      )}
    </div>
  );
}