import FiltersSection from "@/components/dashboard/journals/FiltersSection";
import NoItem from "@/components/dashboard/accounts/NoItem";
import { getBalanceSheet } from "@/app/actions/reports-actions";
import BalanceSheetClient from "@/components/dashboard/balance-sheet/BalanceSheetClient";


type SearchParams = {
  
  date?: string;
};
type Props = {
  params: Promise<{
    organisationId: string;
  }>;
  searchParams: Promise<SearchParams>;
};

export default async function BalanceSheetPage({
  params,
  searchParams,
}: Props) {
  const organisationId = (await params).organisationId;
  const { date = "" } = await searchParams ?? {};

  const response = await getBalanceSheet(organisationId, {date});

  // ❌ ERROR STATE
  if (!response.success) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <h2 className="font-semibold">Something went wrong</h2>
          <p className="text-sm mt-1">
            Failed to load Balance Sheet. Please try again.
          </p>
        </div>
      </div>
    );
  }

  const balanceSheet = response.balanceSheet || [];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 p-4">
      {/* FILTERS */}
      <FiltersSection title={'Balance Sheet'} goToUrl={'reports/balance-sheet'} filters={{ date }} organisationId={organisationId} />

      {/* EMPTY STATE */}
      {!balanceSheet ? 
        <NoItem title="Balance Sheet" modalName="account"/> : (
       (balanceSheet && 
        <BalanceSheetClient
            organisationId={organisationId}
            data={balanceSheet}
               
        />
            )
      )}
    </div>
  );
}