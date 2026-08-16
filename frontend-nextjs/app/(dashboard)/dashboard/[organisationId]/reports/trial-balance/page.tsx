import FiltersSection from "@/components/dashboard/journals/FiltersSection";
import NoItem from "@/components/dashboard/accounts/NoItem";
import { getTrialBalance } from "@/app/actions/reports-actions";
import TrialBalanceClient from "@/components/dashboard/trial-balance/TrialBalanceClient";

type SearchParams = {
  search?: string;
  name?: string;
  as_at_date?: string;
};
type Props = {
  params: Promise<{
    organisationId: string;
  }>;
  searchParams: Promise<SearchParams>;
};

export default async function TrialBalancePage({
  params,
  searchParams,
}: Props) {
  const organisationId = (await params).organisationId;
  const {
    search = "",
    name = "",
    as_at_date = "",
  } = await searchParams ?? {};

  const response = await getTrialBalance(organisationId, {
    search,
    name,
    as_at_date,
  });

  // ❌ ERROR STATE
  if (!response.success) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <h2 className="font-semibold">Something went wrong</h2>
          <p className="text-sm mt-1">
            Failed to load Trial Balance. Please try again.
          </p>
        </div>
      </div>
    );
  }

  const trialBalance = response.trialBalance || [];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 p-4">
      {/* FILTERS */}
      <FiltersSection title={'Trial Balance'} goToUrl={'reports/trial-balance'} filters={{ search, name, as_at_date }} organisationId={organisationId} />

      {/* EMPTY STATE */}
      {!trialBalance ? 
        <NoItem title="Trial Balance" modalName="account"/> : (
        <TrialBalanceClient
          organisationId={organisationId}
          data={trialBalance}
        />
         
        
      )}
    </div>
  );
}