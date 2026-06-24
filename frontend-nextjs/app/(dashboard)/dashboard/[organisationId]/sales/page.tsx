import Link from "next/link";

import { getSales } from "@/app/actions/sale-actions";
import SalesTable from "@/components/dashboard/sales/SalesTable";
import FiltersSection from "@/components/dashboard/journals/FiltersSection";
import Pagination from "@/components/dashboard/journals/Pagination";
import { SalesType } from "@/types";


type SearchParams = {
  search?: string;
  sales?: SalesType;
  date?: string;
  sort_by?: string;
  page?: string;
};
type Props = {
  params: Promise<{
    organisationId: string;
  }>;
  searchParams: Promise<SearchParams>;
};

export default async function SalesPage({
  params,
  searchParams,
}: Props) {
  const organisationId = (await params).organisationId;
  const {
    search = "",
    sales = "",
    date = "",
    sort_by = "",
    page = "1",
  } = await searchParams ?? {};

  const response = await getSales(organisationId, {
    search,
    sales,
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
            Failed to load sales. Please try again.
          </p>
        </div>
      </div>
    );
  }

  const salesData = response.sales || [];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 px-4">
      {/* FILTERS */}
      <FiltersSection title='Sales' goToUrl={'sales'} filters={{ search, sales, sort_by, date, page }} organisationId={organisationId} />

      {/* EMPTY STATE */}
      {salesData.length === 0 ? (
        <div className="bg-white border rounded-xl p-10 text-center space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">
            No sales found
          </h2>

          <p className="text-sm text-gray-500">
            Create your first sale to get started.
          </p>

          <Link
            href="sales/record"
            className="inline-block bg-black text-white px-5 py-2 rounded-lg text-sm hover:bg-gray-800 transition"
          >
            + Add Sale
          </Link>
        </div>
      ) : (
        <>
          {/* TABLE */}
          <SalesTable
            sales={salesData}
            totals={response.totals}
          />

          {/* PAGINATION */}
          {response.pagination && (
            <Pagination
            goToUrl={'sales'}
              organisationId={organisationId}
              pagination={response.pagination}
            />
          )}
        </>
      )}
    </div>
  );
}