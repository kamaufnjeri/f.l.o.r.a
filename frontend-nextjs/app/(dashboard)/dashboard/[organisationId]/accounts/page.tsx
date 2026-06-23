import { getAccounts } from "@/app/actions/account-actions";
import FiltersSection from "@/components/dashboard/journals/FiltersSection";
import AccountTable from "@/components/dashboard/accounts/AccountsTable";
import Pagination from "@/components/dashboard/journals/Pagination";
import NoItem from "@/components/dashboard/accounts/NoItem";

type SearchParams = {
  search?: string;
  name?: string;
  page?: string;
};
type Props = {
  params: Promise<{
    organisationId: string;
  }>;
  searchParams: Promise<SearchParams>;
};

export default async function AccountsPage({
  params,
  searchParams,
}: Props) {
  const organisationId = (await params).organisationId;
  const {
    search = "",
    name = "",
    page = "1",
  } = await searchParams ?? {};

  const response = await getAccounts(organisationId, {
    search,
    name,
    page,
  });

  // ❌ ERROR STATE
  if (!response.success) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <h2 className="font-semibold">Something went wrong</h2>
          <p className="text-sm mt-1">
            Failed to load accounts. Please try again.
          </p>
        </div>
      </div>
    );
  }

  const accounts = response.accounts || [];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 p-4">
      {/* FILTERS */}
      <FiltersSection title={'Accounts'} goToUrl={'accounts'} filters={{ search, name, page }} organisationId={organisationId} account={true}/>

      {/* EMPTY STATE */}
      {accounts.length === 0 ? 
        <NoItem title="Accounts" modalName="account"/> : (
        <>
          
          <AccountTable
            accounts={accounts}
            totals={response.totals}
          />

          {response.pagination && (
            <Pagination
              organisationId={organisationId}
              pagination={response.pagination}
              goToUrl={'accounts'}
            />
          )} 
        </>
      )}
    </div>
  );
}