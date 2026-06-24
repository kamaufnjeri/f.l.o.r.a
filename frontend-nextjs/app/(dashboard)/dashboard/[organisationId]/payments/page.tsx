import Link from "next/link";

import { getPayments } from "@/app/actions/payment-actions";
import PaymentsTable from "@/components/dashboard/payments/PaymentsTable";
import FiltersSection from "@/components/dashboard/journals/FiltersSection";
import Pagination from "@/components/dashboard/journals/Pagination";
import { paymentType } from "@/types";


type SearchParams = {
  search?: string; 
  type: paymentType, 
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

export default async function PaymentsPage({
  params,
  searchParams,
}: Props) {
  const organisationId = (await params).organisationId;
  const {
    search = "",
    type = "",
    sort_by = "",
    date = "",
    page = "1",
  } = await searchParams ?? {};

  const response = await getPayments(organisationId, {
    search,
    type,
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
            Failed to load payments. Please try again.
          </p>
        </div>
      </div>
    );
  }

  const paymentsData = response.payments || [];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 px-4">
      {/* FILTERS */}
      <FiltersSection title='Payments' goToUrl={'payments'} filters={{ search, type, sort_by, date, page }} organisationId={organisationId} />

      {/* EMPTY STATE */}
      {paymentsData.length === 0 ? (
        <div className="bg-white border rounded-xl p-10 text-center space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">
            No payments found
          </h2>

        </div>
      ) : (
        <>
          {/* TABLE */}
          <PaymentsTable
            organisationId={organisationId}

            payments={paymentsData}
            totals={response.totals}
          />

          {/* PAGINATION */}
          {response.pagination && (
            <Pagination
            goToUrl={'payments'}
              organisationId={organisationId}
              pagination={response.pagination}
            />
          )}
        </>
      )}
    </div>
  );
}