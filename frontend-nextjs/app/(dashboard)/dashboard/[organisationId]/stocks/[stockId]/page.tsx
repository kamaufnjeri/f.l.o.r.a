import { getStock } from "@/app/actions/stock-actions";
import ItemFiltersSection from "@/components/dashboard/accounts/ItemFiltersSection";
import SingleStock from "@/components/dashboard/stocks/SingleStock";

type SearchParams = {
  date?: string;
};
type Props = {
  params: Promise<{
    organisationId: string;
    stockId: string;
  }>;
  searchParams: Promise<SearchParams>;
};

export default async function StocksPage({
  params,
  searchParams,
}: Props) {
  const { organisationId, stockId } = await params;

  const {
    date = "",
  } = await searchParams ?? {};

  const stockResponse = await getStock(organisationId, stockId, {
    date
  });

  // ❌ ERROR STATE
  if (!stockResponse.success) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <h2 className="font-semibold">Something went wrong</h2>
          <p className="text-sm mt-1">
            Failed to load stock. Please try again. {stockResponse.error}
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 p-4">
    
      <div className="space-y-4">
      <ItemFiltersSection title={`${stockResponse.stock.name} Stock`} goToUrl={`stocks/${stockResponse.stock.id}`} defaultDate={date} organisationId={organisationId} />
      <SingleStock stock={stockResponse.stock} organisationId={organisationId} date={date}/>
     </div>
    </div>
  );
}