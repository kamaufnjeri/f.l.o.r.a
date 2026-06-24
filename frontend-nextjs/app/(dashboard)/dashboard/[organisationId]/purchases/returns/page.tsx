import Link from "next/link";

import { getPurchaseReturns } from "@/app/actions/returns-actions";
import ReturnsTable from "@/components/dashboard/returns/ReturnsTable";
import FiltersSection from "@/components/dashboard/journals/FiltersSection";
import Pagination from "@/components/dashboard/journals/Pagination";


type SearchParams = {
  search?: string; 
  sort_by?: string;
  date?: string; 
  page?: string 
}
type Props = {
  params: Promise<{
    organisationId: string;
  }>;
  searchParams: Promise<SearchParams>;
};

export default async function PurchaseReturnsPage({
  params,
  searchParams,
}: Props) {
  const organisationId = (await params).organisationId;
  const {
    search = "",
    sort_by = "",
    date = "",
    page = "1",
  } = await searchParams ?? {};

  const response = await getPurchaseReturns(organisationId, {
    search,
    date,
    sort_by,
    page,
  });

  // ❌ ERROR STATE
  if (!response.success) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <h2 className="font-semibold">Something went wrong</h2>
          <p className="text-sm mt-1">
            Failed to load purchase returns. Please try again.
          </p>
        </div>
      </div>
    );
  }

  const purchaseReturnsData = response.purchaseReturns || [];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 px-4">
      {/* FILTERS */}
      <FiltersSection title='Purchase Returns' goToUrl={'purchases/returns'} filters={{ search, sort_by, date, page }} organisationId={organisationId} />

      {/* EMPTY STATE */}
      {purchaseReturnsData.length === 0 ? (
        <div className="bg-white border rounded-xl p-10 text-center space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">
            No purchase returns found
          </h2>

        </div>
      ) : (
        <>
          {/* TABLE */}
          <ReturnsTable
            organisationId={organisationId}

            returns={purchaseReturnsData}
            totals={response.totals}
          />

          {/* PAGINATION */}
          {response.pagination && (
            <Pagination
            goToUrl={'purchase/returns'}
              organisationId={organisationId}
              pagination={response.pagination}
            />
          )}
        </>
      )}
    </div>
  );
}