import NoItem from "@/components/dashboard/accounts/NoItem";
import { getDashboard } from "@/app/actions/dashboard-actions";
import DashboardHeader from "@/components/dashboard/dashboard/DashboardHeader";
import DashboardDataSection from "@/components/dashboard/dashboard/DashboardDataSection";


type SearchParams = {
  
  date?: string;
};
type Props = {
  params: Promise<{
    organisationId: string;
  }>;
  searchParams: Promise<SearchParams>;
};

export default async function DashboardPage({
  params,
  searchParams,
}: Props) {
  const organisationId = (await params).organisationId;
  const { date = "" } = await searchParams ?? {};

  const response = await getDashboard(organisationId, {date});

  // ❌ ERROR STATE
  if (!response.success) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <h2 className="font-semibold">Something went wrong</h2>
          <p className="text-sm mt-1">
            Failed to load dashboard. Please try again.
          </p>
        </div>
      </div>
    );
  }

  const dashboard = response.dashboard || [];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 p-4">
      {/* FILTERS */}
      <DashboardHeader organisationId={organisationId} date={date}/>

      {/* EMPTY STATE */}
      {!dashboard ? 
        <NoItem title="Dashboard" modalName="account"/> : (
       (dashboard && 
<DashboardDataSection
        organisationId={organisationId}
        data={dashboard}
      />        
      ))}
    </div>
  );
}