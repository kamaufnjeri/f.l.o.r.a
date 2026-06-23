import { getAccount } from "@/app/actions/account-actions";
import ItemFiltersSection from "@/components/dashboard/accounts/ItemFiltersSection";
import SingleAccount from "@/components/dashboard/accounts/SingleAccount";

type SearchParams = {
  date?: string;
};
type Props = {
  params: Promise<{
    organisationId: string;
    accountId: string;
  }>;
  searchParams: Promise<SearchParams>;
};

export default async function AccountsPage({
  params,
  searchParams,
}: Props) {
  const { organisationId, accountId } = await params;

  const {
    date = "",
  } = await searchParams ?? {};

  const accountResponse = await getAccount(organisationId, accountId, {
    date
  });

  // ❌ ERROR STATE
  if (!accountResponse.success) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <h2 className="font-semibold">Something went wrong</h2>
          <p className="text-sm mt-1">
            Failed to load account. Please try again.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 p-4">
    
      <div className="space-y-4">
      <ItemFiltersSection title={`${accountResponse.account.name} Account`} goToUrl={`accounts/${accountResponse.account.id}`} defaultDate={date} organisationId={organisationId} />
      <SingleAccount account={accountResponse.account} organisationId={organisationId} date={date}/>
     </div>
    </div>
  );
}