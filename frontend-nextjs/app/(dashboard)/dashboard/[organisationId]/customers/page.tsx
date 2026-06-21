import { getCustomers } from "@/app/actions/customer-actions";
import FiltersSection from "@/components/dashboard/journals/FiltersSection";
import CustomerTable from "@/components/dashboard/customers/CustomersTable";
import Pagination from "@/components/dashboard/journals/Pagination";
import NoItem from "@/components/dashboard/accounts/NoItem";

type SearchParams = {
  search?: string;
  name?: string;
  page?: string;
};
type Props = {
  params: Promise<{
    organisationId: string;
  }>;
  searchParams: Promise<SearchParams>;
};

export default async function CustomersPage({
  params,
  searchParams,
}: Props) {
  const organisationId = (await params).organisationId;
  const {
    search = "",
    name = "",
    page = "1",
  } = await searchParams ?? {};

  const response = await getCustomers(organisationId, {
    search,
    name,
    page,
  });

  // ❌ ERROR STATE
  if (!response.success) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <h2 className="font-semibold">Something went wrong</h2>
          <p className="text-sm mt-1">
            Failed to load customers. Please try again.
          </p>
        </div>
      </div>
    );
  }

  const customers = response.customers || [];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 p-4">
      {/* FILTERS */}
      <FiltersSection title={'Customers'} goToUrl={'customers'} filters={{ search, name, page }} organisationId={organisationId} />

      {/* EMPTY STATE */}
      {customers.length === 0 ? (
         <NoItem title="Customers" modalName="customer"/>
      ) : (
        <>
          
          <CustomerTable
            customers={customers}
            totals={response.totals}
          />

          {response.pagination && (
            <Pagination
              organisationId={organisationId}
              pagination={response.pagination}
              goToUrl={'customers'}
            />
          )} 
        </>
      )}
    </div>
  );
}