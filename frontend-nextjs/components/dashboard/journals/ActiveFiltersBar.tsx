"use client";

import { useAuthStore } from "@/stores/authStore";

type Props = {
  filters: Record<string, string | undefined>;
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ActiveFiltersBar({
  filters,
}: Props) {
  const { currentOrg } = useAuthStore();

  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const reportDate = (() => {
    const date = filters.date;

    if (!date) {
      return `As at ${today}`;
    }

    if (date.includes("to")) {
      const [from, to] = date.split("to");

      return `${formatDate(from)} → ${formatDate(to)}`;
    }

    switch (date) {
      case "today":
        return "Today";
      case "yesterday":
        return "Yesterday";
      case "this_week":
        return "This Week";
      case "this_month":
        return "This Month";
      default:
        return date;
    }
  })();

  const chips = Object.entries(filters).filter(
    ([key, value]) =>
      key !== "date" &&
      value &&
      value.trim() !== ""
  );

  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="px-6 py-10 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-gray-500">
          {currentOrg?.org_name || "Organisation"}
        </p>

        <h2 className="mt-3 text-2xl md:text-3xl font-bold text-gray-900">
          Journal Entries
        </h2>

        <p className="mt-2 text-sm md:text-base text-gray-500">
          {reportDate}
        </p>
      </div>

      {chips.length > 0 && (
        <div className="border-t bg-gray-50 px-4 py-4">
          <div className="flex flex-wrap justify-center gap-2">
            {chips.map(([key, value]) => (
              <div
                key={key}
                className="rounded-full bg-white border px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm"
              >
                {key === "search" && `Search: ${value}`}
                {key === "sort_by" && `Sort: ${value}`}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}