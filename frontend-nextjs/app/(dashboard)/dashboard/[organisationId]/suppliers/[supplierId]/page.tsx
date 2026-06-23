import { getSupplier } from "@/app/actions/supplier-actions";
import ItemFiltersSection from "@/components/dashboard/accounts/ItemFiltersSection";
import SingleSupplier from "@/components/dashboard/suppliers/SingleSupplier";

type SearchParams = {
  date?: string;
};
type Props = {
  params: Promise<{
    organisationId: string;
    supplierId: string;
  }>;
  searchParams: Promise<SearchParams>;
};

export default async function SuppliersPage({
  params,
  searchParams,
}: Props) {
  const { organisationId, supplierId } = await params;

  const {
    date = "",
  } = await searchParams ?? {};

  const supplierResponse = await getSupplier(organisationId, supplierId, {
    date
  });

  // ❌ ERROR STATE
  if (!supplierResponse.success) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <h2 className="font-semibold">Something went wrong</h2>
          <p className="text-sm mt-1">
            Failed to load supplier. Please try again.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 p-4">
    
      <div className="space-y-4">
      <ItemFiltersSection title={`${supplierResponse.supplier.name} Supplier`} goToUrl={`suppliers/${supplierResponse.supplier.id}`} defaultDate={date} organisationId={organisationId} />
      <SingleSupplier supplier={supplierResponse.supplier} organisationId={organisationId} date={date}/>
     </div>
    </div>
  );
}