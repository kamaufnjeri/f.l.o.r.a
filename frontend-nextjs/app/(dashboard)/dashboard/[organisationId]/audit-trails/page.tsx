import { getAuditTrails } from "@/app/actions/audit-trails";
import AuditTable from "@/components/dashboard/audit-trails/AuditTable";
import FiltersSection from "@/components/dashboard/journals/FiltersSection";
import Pagination from "@/components/dashboard/journals/Pagination";
import Link from "next/link";

// import AuditTrailTable from "@/components/dashboard/audit trails/AuditTrailTable";
// import FiltersSection from "@/components/dashboard/audit trails/FiltersSection";
// import Pagination from "@/components/dashboard/audit trails/Pagination";

type SearchParams = {
  action?: string;
  model_name?: string;
  date?: string;
  sort_by?: string;
  page?: string;
};
type Props = {
  params: Promise<{
    organisationId: string;
  }>;
  searchParams: Promise<SearchParams>;
};

export default async function AuditTrailsPage({
  params,
  searchParams,
}: Props) {
  const organisationId = (await params).organisationId;
  const {
    action = "",
    model_name = "",
    date = "",
    sort_by = "",
    page = "1",
  } = await searchParams ?? {};

  const response = await getAuditTrails(organisationId, {
    action,
    model_name,
    date,
    sort_by,
    page,
  });

  // ❌ ERROR STATE
  if (!response.success) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <h2 className="font-semibold">Something went wrong</h2>
          <p className="text-sm mt-1">
            Failed to load audit trails. {response.error}. Please try again.
          </p>
        </div>
      </div>
    );
  }

  const auditTrails = response.auditTrails || [];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 px-4">
      {/* FILTERS */}
      <FiltersSection title='Audit Trails' goToUrl={'audit-trails'} filters={{ action, model_name, sort_by, date, page }} organisationId={organisationId}/>

      {/* EMPTY STATE */}
      {auditTrails.length === 0 ? (
        <div className="bg-white border rounded-xl p-10 text-center space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">
            No audit trails found
          </h2>

          <p className="text-sm text-gray-500">
            Create your first journal entry to get started.
          </p>

          <Link
            href="journals/record"
            className="inline-block bg-black text-white px-5 py-2 rounded-lg text-sm hover:bg-gray-800 transition"
          >
            + Add Journal
          </Link>
        </div>
      ) : (
        <>
          {/* TABLE */}
          <AuditTable
          organisationId={organisationId}
            audits={auditTrails}
          /> 

          {/* PAGINATION */}
          {response.pagination && (
            <Pagination
            goToUrl={'audit-trails'}
              organisationId={organisationId}
              pagination={response.pagination}
            />
          )}
        </>
      )}
    </div>
  );
}