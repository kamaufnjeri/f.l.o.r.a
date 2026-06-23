import { getCustomer } from "@/app/actions/customer-actions";
import ItemFiltersSection from "@/components/dashboard/accounts/ItemFiltersSection";
import SingleCustomer from "@/components/dashboard/customers/SingleCustomer";

type SearchParams = {
  date?: string;
};
type Props = {
  params: Promise<{
    organisationId: string;
    customerId: string;
  }>;
  searchParams: Promise<SearchParams>;
};

export default async function CustomersPage({
  params,
  searchParams,
}: Props) {
  const { organisationId, customerId } = await params;

  const {
    date = "",
  } = await searchParams ?? {};

  const customerResponse = await getCustomer(organisationId, customerId, {
    date
  });

  // ❌ ERROR STATE
  if (!customerResponse.success) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <h2 className="font-semibold">Something went wrong</h2>
          <p className="text-sm mt-1">
            Failed to load customer. Please try again.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 p-4">
    
      <div className="space-y-4">
      <ItemFiltersSection title={`${customerResponse.customer.name} Customer`} goToUrl={`customers/${customerResponse.customer.id}`} defaultDate={date} organisationId={organisationId} />
      <SingleCustomer customer={customerResponse.customer} organisationId={organisationId} date={date}/>
     </div>
    </div>
  );
}