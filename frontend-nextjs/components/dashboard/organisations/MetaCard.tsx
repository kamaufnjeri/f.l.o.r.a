"use client";

import React from "react";

interface MetaCardProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
}

export default function MetaCard({
  icon,
  label,
  value,
}: MetaCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        {icon}
        <span>{label}</span>
      </div>

      <p className="mt-2 truncate text-sm font-medium text-gray-900">
        {value || "—"}
      </p>
    </div>
  );
}