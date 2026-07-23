import FiltersSection from "@/components/dashboard/journals/FiltersSection";
import NoItem from "@/components/dashboard/accounts/NoItem";
import { getCashFlow } from "@/app/actions/reports-actions";
import CashFlowClient from "@/components/dashboard/cash-flow/CashFlowClient";


type SearchParams = {
  
  date?: string;
};
type Props = {
  params: Promise<{
    organisationId: string;
  }>;
  searchParams: Promise<SearchParams>;
};

export default async function CashFlowPage({
  params,
  searchParams,
}: Props) {
  const organisationId = (await params).organisationId;
  const { date = "" } = await searchParams ?? {};

  const response = await getCashFlow(organisationId, {date});

  // ❌ ERROR STATE
  if (!response.success) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <h2 className="font-semibold">Something went wrong</h2>
          <p className="text-sm mt-1">
            Failed to load CashFlow Statement. Please try again.
          </p>
        </div>
      </div>
    );
  }

  const cashFlow = response.cashFlow || [];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 p-4">
      {/* FILTERS */}
      <FiltersSection title={'Cash Flow Statement'} goToUrl={'reports/cash-flow'} filters={{ date }} organisationId={organisationId} />

      {/* EMPTY STATE */}
      {!cashFlow ? 
        <NoItem title="Cash Flow Statement" modalName="account"/> : (
       (cashFlow && 
        <CashFlowClient
            data={cashFlow}
               
        />
            )
      )}
    </div>
  );
}