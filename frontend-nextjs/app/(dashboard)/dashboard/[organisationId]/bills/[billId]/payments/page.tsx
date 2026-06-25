import { getBillInvoicePayments } from "@/app/actions/payment-actions";
import Pagination from "@/components/dashboard/journals/Pagination";
import SingleItemPayments from "@/components/dashboard/payments/BillInvoicePayments";
import BillInvoicePaymentsHeader from "@/components/dashboard/payments/BillInvoicePaymentsHeader";


type SearchParams = { 
  page?: string 
}
type Props = {
  params: Promise<{
    organisationId: string;
    billId: string;
  }>;
  searchParams: Promise<SearchParams>;
};

export default async function PaymentsPage({
  params,
  searchParams,
}: Props) {
  const { organisationId, billId } = await params;
  const {
   
    page = "1",
  } = await searchParams ?? {};

  const response = await getBillInvoicePayments(organisationId, billId, 'bills', {
    page,
  });
  console.log(response);

  // ❌ ERROR STATE
  if (!response.success) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <h2 className="font-semibold">Something went wrong</h2>
          <p className="text-sm mt-1">
            Failed to load payments. Please try again {response.error}.
          </p>
        </div>
      </div>
    );
  }

  const paymentsData = response.payments || [];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 px-4">
      {/* FILTERS */}
      <BillInvoicePaymentsHeader title={response.title} downloadType={`bills/${billId}/payments`} page={page} />
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
          <SingleItemPayments
          type='bills'
          billId={billId}
            organisationId={organisationId}
            payments={paymentsData}
            totals={response.totals}
          />

          {/* PAGINATION */}
          {response.pagination && (
            <Pagination
            goToUrl={`/bills/${billId}/payments`}
              organisationId={organisationId}
              pagination={response.pagination}
            />
          )}
        </>
      )}
    </div>
  );
}