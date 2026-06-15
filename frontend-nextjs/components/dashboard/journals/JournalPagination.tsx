"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";

type Props = {
  pagination: {
    next: string | null;
    previous: string | null;
  };
  organisationId: string;
};

export default function JournalPagination({ pagination, organisationId }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  // 📄 current page from URL
  const currentPage = Number(params.get("page") || 1);

  const goToUrl = (url: string | null) => {
    if (!url) return;

    const parsed = new URL(url);
    router.push(`/dashboard/${organisationId}/journals${parsed.search}`);
  };

  return (
    <div className="flex items-center justify-end gap-3 text-sm">
      {/* PREVIOUS */}
      <button
        disabled={!pagination.previous}
        onClick={() => goToUrl(pagination.previous)}
        className="border px-3 py-1 rounded disabled:opacity-40 cursor-pointer"
      >
        Previous
      </button>

      {/* PAGE INDICATOR */}
      <div className="px-3 py-1 border rounded bg-gray-50 text-gray-700 font-medium">
        Page {currentPage}
      </div>

      {/* NEXT */}
      <button
        disabled={!pagination.next}
        onClick={() => goToUrl(pagination.next)}
        className="border px-3 py-1 rounded disabled:opacity-40 cursor-pointer"
      >
        Next
      </button>
    </div>
  );
}