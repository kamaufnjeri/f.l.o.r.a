import { getSalesPurchaseReturns } from "@/app/actions/returns-actions";
import Pagination from "@/components/dashboard/journals/Pagination";
import BillInvoicePaymentsHeader from "@/components/dashboard/payments/BillInvoicePaymentsHeader";
import PurchaseSalesReturns from "@/components/dashboard/returns/PurchaseSalesReturns";


type SearchParams = { 
  page?: string 
}
type Props = {
  params: Promise<{
    organisationId: string;
    purchaseId: string;
  }>;
  searchParams: Promise<SearchParams>;
};

export default async function ReturnsPage({
  params,
  searchParams,
}: Props) {
  const { organisationId, purchaseId } = await params;
  const {
   
    page = "1",
  } = await searchParams ?? {};

  const response = await getSalesPurchaseReturns(organisationId, purchaseId, 'purchases', {
    page,
  });

  // ❌ ERROR STATE
  if (!response.success) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <h2 className="font-semibold">Something went wrong</h2>
          <p className="text-sm mt-1">
            Failed to load returns. Please try again {response.error}.
          </p>
        </div>
      </div>
    );
  }

  const returnsData = response.returns || [];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 px-4">
      {/* FILTERS */}
      <BillInvoicePaymentsHeader title={response.title} downloadType={`purchases/${purchaseId}/returns`} page={page} />

      {/* EMPTY STATE */}
      {returnsData.length === 0 ? (
        <div className="bg-white border rounded-xl p-10 text-center space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">
            No returns found
          </h2>

        </div>
      ) : (
        <>
          {/* TABLE */}
          <PurchaseSalesReturns
          type='purchases'
           purchaseId={purchaseId}
            organisationId={organisationId}
            returns={returnsData}
            totals={response.totals}
          />

          {/* PAGINATION */}
          {response.pagination && (
            <Pagination
            goToUrl={`/purchases/${purchaseId}/returns`}
              organisationId={organisationId}
              pagination={response.pagination}
            />
          )}
        </>
      )}
    </div>
  );
}