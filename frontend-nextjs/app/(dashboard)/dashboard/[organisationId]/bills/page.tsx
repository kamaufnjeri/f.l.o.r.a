import Link from "next/link";

import { getBills } from "@/app/actions/bill-invoice-actions";
import BillsTable from "@/components/dashboard/bills/BillsTable";
import FiltersSection from "@/components/dashboard/journals/FiltersSection";
import Pagination from "@/components/dashboard/journals/Pagination";
import { DueDaysType, StatusType } from "@/types";


type SearchParams = {
  search?: string; 
  status: StatusType, 
  due_days?: DueDaysType; 
  page?: string 
}
type Props = {
  params: Promise<{
    organisationId: string;
  }>;
  searchParams: Promise<SearchParams>;
};

export default async function BillsPage({
  params,
  searchParams,
}: Props) {
  const organisationId = (await params).organisationId;
  const {
    search = "",
    status = "",
    due_days = "",
    page = "1",
  } = await searchParams ?? {};

  const response = await getBills(organisationId, {
    search,
    status,
    due_days,
    page,
  });

  // ❌ ERROR STATE
  if (!response.success) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <h2 className="font-semibold">Something went wrong</h2>
          <p className="text-sm mt-1">
            Failed to load bills. Please try again.
          </p>
        </div>
      </div>
    );
  }

  const billsData = response.bills || [];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 px-4">
      {/* FILTERS */}
      <FiltersSection title='Bills' goToUrl={'bills'} filters={{ search, due_days, status, page }} organisationId={organisationId} />

      {/* EMPTY STATE */}
      {billsData.length === 0 ? (
        <div className="bg-white border rounded-xl p-10 text-center space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">
            No bills found
          </h2>

        </div>
      ) : (
        <>
          {/* TABLE */}
          <BillsTable
            organisationId={organisationId}

            bills={billsData}
            totals={response.totals}
          />

          {/* PAGINATION */}
          {response.pagination && (
            <Pagination
            goToUrl={'bills'}
              organisationId={organisationId}
              pagination={response.pagination}
            />
          )}
        </>
      )}
    </div>
  );
}