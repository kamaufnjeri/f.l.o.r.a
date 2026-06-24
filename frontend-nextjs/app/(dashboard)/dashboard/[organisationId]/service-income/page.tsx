import Link from "next/link";

import { getServiceIncomes } from "@/app/actions/service-income-actions";
import ServiceIncomesTable from "@/components/dashboard/services/ServiceIncomesTable";
import FiltersSection from "@/components/dashboard/journals/FiltersSection";
import Pagination from "@/components/dashboard/journals/Pagination";
import { SalesType } from "@/types";


type SearchParams = {
  search?: string;
  service_income?: SalesType;
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

export default async function ServiceIncomesPage({
  params,
  searchParams,
}: Props) {
  const organisationId = (await params).organisationId;
  const {
    search = "",
    service_income = "",
    date = "",
    sort_by = "",
    page = "1",
  } = await searchParams ?? {};

  const response = await getServiceIncomes(organisationId, {
    search,
    service_income,
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
            Failed to load service incomes. Please try again.
          </p>
        </div>
      </div>
    );
  }

  const serviceIncomes = response.serviceIncomes || [];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 px-4">
      {/* FILTERS */}
      <FiltersSection title='Service Incomes' goToUrl={'service-income'} filters={{ search, service_income, sort_by, date, page }} organisationId={organisationId} />

      {/* EMPTY STATE */}
      {serviceIncomes.length === 0 ? (
        <div className="bg-white border rounded-xl p-10 text-center space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">
            No service incomes found
          </h2>

          <p className="text-sm text-gray-500">
            Create your first service income to get started.
          </p>

          <Link
            href="service-income/record"
            className="inline-block bg-black text-white px-5 py-2 rounded-lg text-sm hover:bg-gray-800 transition"
          >
            + Add Service Income
          </Link>
        </div>
      ) : (
        <>
          {/* TABLE */}
          <ServiceIncomesTable
            serviceIncomes={serviceIncomes}
            totals={response.totals}
          />

          {/* PAGINATION */}
          {response.pagination && (
            <Pagination
            goToUrl={'service-income'}
              organisationId={organisationId}
              pagination={response.pagination}
            />
          )}
        </>
      )}
    </div>
  );
}