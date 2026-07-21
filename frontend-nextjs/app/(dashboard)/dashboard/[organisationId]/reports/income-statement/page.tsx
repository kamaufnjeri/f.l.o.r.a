import FiltersSection from "@/components/dashboard/journals/FiltersSection";
import NoItem from "@/components/dashboard/accounts/NoItem";
import { getIncomeStatement } from "@/app/actions/reports-actions";
import TrialBalanceClient from "@/components/dashboard/trial-balance/TrialBalanceClient";

type SearchParams = {
  
  date?: string;
};
type Props = {
  params: Promise<{
    organisationId: string;
  }>;
  searchParams: Promise<SearchParams>;
};

export default async function IncomeStatementPage({
  params,
  searchParams,
}: Props) {
  const organisationId = (await params).organisationId;
  const { date = "" } = await searchParams ?? {};

  const response = await getIncomeStatement(organisationId, {date});

  // ❌ ERROR STATE
  if (!response.success) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <h2 className="font-semibold">Something went wrong</h2>
          <p className="text-sm mt-1">
            Failed to load Income Statement. Please try again.
          </p>
        </div>
      </div>
    );
  }

  const incomeStatement = response.incomeStatement || [];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 p-4">
      {/* FILTERS */}
      <FiltersSection title={'Income Statement'} goToUrl={'reports/income-statement'} filters={{ date }} organisationId={organisationId} />

      {/* EMPTY STATE */}
      {!incomeStatement ? 
        <NoItem title="Income Statement" modalName="account"/> : (
       
            <div>{JSON.stringify(incomeStatement)}</div>
      )}
    </div>
  );
}