import Link from "next/link";

import { getPurchases } from "@/app/actions/purchase-actions";
import PurchasesTable from "@/components/dashboard/purchases/PurchasesTable";
import FiltersSection from "@/components/dashboard/journals/FiltersSection";
import Pagination from "@/components/dashboard/journals/Pagination";

export type PurchasesType = "all" | 'is_invoices' | 'is_not_invoices' | "";

type SearchParams = {
  search?: string;
  purchases?: PurchasesType;
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

export default async function PurchasesPage({
  params,
  searchParams,
}: Props) {
  const organisationId = (await params).organisationId;
  const {
    search = "",
    purchases = "",
    date = "",
    sort_by = "",
    page = "1",
  } = await searchParams ?? {};

  const response = await getPurchases(organisationId, {
    search,
    purchases,
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
            Failed to load purchases. Please try again.
          </p>
        </div>
      </div>
    );
  }

  const purchasesData = response.purchases || [];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 px-4">
      {/* FILTERS */}
      <FiltersSection title='Purchases' goToUrl={'purchases'} filters={{ search, purchases, sort_by, date, page }} organisationId={organisationId} />

      {/* EMPTY STATE */}
      {purchasesData.length === 0 ? (
        <div className="bg-white border rounded-xl p-10 text-center space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">
            No purchases found
          </h2>

          <p className="text-sm text-gray-500">
            Create your first purchase to get started.
          </p>

          <Link
            href="purchases/record"
            className="inline-block bg-black text-white px-5 py-2 rounded-lg text-sm hover:bg-gray-800 transition"
          >
            + Add Purchase
          </Link>
        </div>
      ) : (
        <>
          {/* TABLE */}
          <PurchasesTable
            purchases={purchasesData}
            totals={response.totals}
          />

          {/* PAGINATION */}
          {response.pagination && (
            <Pagination
            goToUrl={'purchases'}
              organisationId={organisationId}
              pagination={response.pagination}
            />
          )}
        </>
      )}
    </div>
  );
}